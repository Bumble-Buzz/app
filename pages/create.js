import { useEffect, useState } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import { ethers } from 'ethers';
import FormData from 'form-data';

import WALLTET from '../utils/wallet';
import API from '../components/Api';
import Toast from '../components/Toast';
import NoImageAvailable from '../public/no-image-available.png';
import Unauthenticated from '../components/Unauthenticated';


import { useAuth } from '../contexts/AuthContext'

import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeNftAbi from '../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function Create() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  const [isLoading, setLoading] = useState(false);
  const [isMinted, setMinted] = useState(false);
  const [values, setValues] = useState({
    name: '',
    description: '',
    category: 'Art',
    commission: '',
    attributes: [],
    image: null
  });
  const [transaction, setTransaction] = useState();

  const [selectedImage, setSelectedImage] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [attributeType, setAttributeType] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  useEffect(() => {
    checkTransaction();
  }, [transaction]);


  const checkTransaction = async () => {
    if (transaction) {
      const txReceipt = await WALLTET.checkTransaction(transaction);
      if (txReceipt && txReceipt.blockNumber) {
        setTransaction();
        initValues();
        setMinted(true);
        setLoading(false);
      } else {
        console.log('not yet mined');
      }
    }
  };

  const handleName = (e) => {
    const existingValues = values;
    existingValues.name = e.target.value;
    setValues(existingValues);
  };

  const handleDescription = (e) => {
    const existingValues = values;
    existingValues.description = e.target.value;
    setValues(existingValues);
  };

  const handleCategory = (e) => {
    const existingValues = values;
    existingValues.category = e.target.value;
    setValues(existingValues);
  };

  const handleCommission = (e) => {
    const existingValues = values;
    existingValues.commission = e.target.value;
    setValues(existingValues);
  };

  const handleAttributes = (e) => {
    if (attributeType.length > 0) {
      const existingAttributes = attributes;
      existingAttributes.push({ 'trait_type':attributeType, 'value':attributeValue });
      setAttributes(existingAttributes);
      setAttributeType('');
      setAttributeValue('');
      const existingValues = values;
      existingValues.attributes = existingAttributes;
      setValues(existingValues);
    }
  };

  const handleAttributeDelete = (selectedAttribute) => {
    const filteredAttributes = attributes.filter(
      attribute => attribute['trait_type'] !== selectedAttribute['trait_type']
    );
    setAttributes(filteredAttributes);
    const existingValues = values;
    existingValues.attributes = filteredAttributes;
    setValues(existingValues);
  };

  const handleImage = (e) => {
    const image = e.target.files[0];
    if (image && image.size > 10485760) {
      Toast.error("Image size too big. Max 10mb");
    }
    const existingValues = values;
    setSelectedImage(image);
    existingValues.image = image;
    setValues(existingValues);
  };

  const updateValue = (property, value) => {
    const existingValues = values;
    existingValues[property] = value;
    setValues(existingValues);
  };

  const initValues = () => {
    setSelectedImage(null);
    setAttributes([]);
    setValues({
      name: '',
      description: '',
      category: 'Art',
      commission: '',
      attributes: [],
      image: null
    });
  };

  const createNft = async (e) => {
    console.log('start - createNft');
    e.preventDefault();

    if (!await WALLTET.isNetworkValid()) {
      console.error('Wrong network, switch to Avalanche');
      return;
    }

    const signer = await WALLTET.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);
    try {
      setLoading(true);

      // upload image to ipfs
      const imageCid = await uploadImage();

      // upload config to ipfs
      const configCid = await uploadConfig(imageCid);
      console.log('configCid:', configCid);

      const val = await contract.mint(
        values.commission,
        configCid,
        { value: ethers.utils.parseEther('0.50') }
      );
      setTransaction(val);
      // console.log('val', val);
      const balance = await contract.balanceOf(val.from);
      console.log('balance', balance.toLocaleString(undefined,0));
    } catch (e) {
      Toast.error(e.message);
      setLoading(false);
    }
    console.log('end - createNft');
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("name", values.image.name);
    formData.append("image", values.image);

    let cid;
    try {
      await API.ipfs.image(formData).then(res => {
        cid = res.data;
      });
    } catch (e) {
      Toast.error("Error uploading image to IPFS");
    }

    return cid;
  }

  const uploadConfig = async (_imageCid) => {

    const payload = {
      name: values.name,
      description: values.description,
      image: `ipfs://${_imageCid}`,
      imageHttp: `https://ipfs.io/ipfs/${_imageCid}`,
      attributes: values.attributes
    };

    let cid;
    try {
      await API.ipfs.config(payload).then(res => {
        cid = res.data;
      });
    } catch (e) {
      Toast.error("Error uploading config to IPFS");
    }

    return cid;
  }

  const testBlockchain = async () => {
    console.log('start - testBlockchain');

    const provider = await WALLTET.getProvider();
    const signer = await WALLTET.getSigner();

    const currentBlockNumber = await provider.getBlockNumber();
    console.log('current block number', currentBlockNumber);

    const blocks = await provider.getBlockWithTransactions(currentBlockNumber)
    console.log('blocks', blocks);

    console.log('transactions', blocks.transactions);
    console.log('transaction value', blocks.transactions[0].value.toString());

    console.log('end - testBlockchain');
  }

  const listDbTables = async () => {
    console.log('start - listDbTables');

    const results = await API.db.table.list({});
    console.log('Tables:', results.data);

    console.log('end - listDbTables');
  }

  const createDbTable = async () => {
    console.log('start - createDbTable');

    const payload = {
      TableName: "people",
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "N",
        }
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        }
      ],
      BillingMode: "PAY_PER_REQUEST",
    };
    const results = await API.db.table.create(payload);
    console.log('Created:', results.data);

    console.log('end - createDbTable');
  }

  const statusDbTable = async () => {
    console.log('start - statusDbTable');

    const payload = {
      TableName: "people",
    };
    const results = await API.db.table.status(payload);
    console.log('Status:', results.data);

    console.log('end - statusDbTable');
  }

  const deleteDbTable = async () => {
    console.log('start - deleteDbTable');

    const payload = {
      TableName: "people",
    };
    const results = await API.db.table.delete(payload);
    console.log('Deleted:', results.data);

    console.log('end - deleteDbTable');
  }

  const scanDbTable = async () => {
    console.log('start - scanDbTable');

    const payload = {
      TableName: "people",
    };
    const results = await API.db.table.scan(payload);
    console.log('Scan:', results.data);

    console.log('end - scanDbTable');
  }

  const getDbItem = async () => {
    console.log('start - getDbItem');

    const payload = {
      TableName: "people",
      Key: {
        'id': 1
      }
    };
    const results = await API.db.item.get(payload);
    console.log('Get item:', results.data);

    console.log('end - getDbItem');
  }

  const getBatchDbItem = async () => {
    console.log('start - getBatchDbItem');

    const payload = {
      RequestItems: {
        people: {
          Keys: [
            { id: 1 },
            { id: 2 },
            { id: 3 }
          ]
        }
      },
    };
    const results = await API.db.item.getBatch(payload);
    console.log('Get item batch:', results.data);

    console.log('end - getBatchDbItem');
  }

  const putDbItem = async () => {
    console.log('start - putDbItem');

    const payload = {
      TableName: "people",
      Item: {
        'id': 1,
        'name': 'john',
        'age': 123
      }
    };
    const results = await API.db.item.put(payload);
    console.log('Put item:', results.data);

    console.log('end - putDbItem');
  }

  const putBatchDbItem = async () => {
    console.log('start - putBatchDbItem');

    const payload = {
      RequestItems: {
        people: [
          {
            PutRequest: {
              Item: {
                'id': 2,
                'name': 'smith',
                'age': 456
              }
            }
          },
          {
            PutRequest: {
              Item: {
                'id': 3,
                'name': 'joe',
                'age': 789
              }
            }
          }
        ]
      },
    };
    const results = await API.db.item.putBatch(payload);
    console.log('Put item batch:', results.data);

    console.log('end - putBatchDbItem');
  }

  const updateDbItem = async () => {
    console.log('start - updateDbItem');

    const payload = {
      TableName: "people",
      Key: { 'id': 1 },
      ExpressionAttributeNames: { "#myName": "name" },
      UpdateExpression: `set #myName = :name`,
      ExpressionAttributeValues: { ":name": "joe" }
    };
    const results = await API.db.item.update(payload);
    console.log('Update item:', results.data);

    console.log('end - updateDbItem');
  }

  const deleteDbItem = async () => {
    console.log('start - deleteDbItem');

    const payload = {
      TableName: "people",
      Key: {
        'id': 1
      }
    };
    const results = await API.db.item.delete(payload);
    console.log('Delete item:', results.data);

    console.log('end - deleteDbItem');
  }

  const deleteBatchDbItem = async () => {
    console.log('start - deleteBatchDbItem');

    const payload = {
      RequestItems: {
        people: [
          {
            DeleteRequest: {
              Key: { id: 2 }
            }
          },
          {
            DeleteRequest: {
              Key: { id: 3 }
            }
          }
        ]
      },
    };
    const results = await API.db.item.deleteBatch(payload);
    console.log('Delete item batch:', results.data);

    console.log('end - deleteBatchDbItem');
  }


  if (!session || sessionStatus !== 'authenticated' || session.user.id !== AuthContext.state.account || !AuthContext.state.isNetworkValid) {
    return (
      <Unauthenticated link={'/authenticate'}></Unauthenticated>
    )
  }

  return (
    <main className="flex flex-nowrap flex-col items-center px-0 py-1 w-full">
      <div className="flex flex-nowrap rounded shadow-lg w-full" style={{minHeight: '500px'}}>

        {/* Page Content */}
        <div className="flex flex-col p-2 w-full">

          <div className="p-2 flex flex-col">
            <h2 className="text-3xl font-semibold text-gray-800">Create <span className="text-indigo-600">NFT</span></h2>
          </div>

          {isMinted ?
            <div className="p-2 flex flex-col items-center text-center">
              <div className="">
                <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
                  <p className="text-gray-700 text-base mb-4">
                    Congratulations, you have successfully minted your NFT!
                  </p> 
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {setMinted(false);}}
                  >
                    Create another NFT
                  </button>
                </div>
              </div>
            </div>
            :
            <div className="p-2 flex flex-col items-center">
              <form onSubmit={(e) => {createNft(e)}} method="POST" className="">
                <div className="shadow overflow-hidden rounded-md">

                  <div className="flex flex-col md:flex-row items-center px-4 py-4 bg-white">

                    <div className="w-full">
                      <div className="my-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="off"
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={handleName}
                        />
                      </div>

                      <div className="my-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder=""
                            defaultValue={''}
                            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                            onChange={handleDescription}
                          />
                        <p className="mt-2 text-sm text-gray-500">
                          Brief description about your NFT.
                        </p>
                      </div>

                      <div className="my-2">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          id="category"
                          name="category"
                          autoComplete="category-name"
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={handleCategory}
                        >
                          <option>Art</option>
                          <option>Games</option>
                          <option>Meme</option>
                          <option>Photography</option>
                          <option>Sports</option>
                          <option>NSFW</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="my-2">
                        <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          name="commission"
                          id="commission"
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={handleCommission}
                        />
                      </div>

                      <div className="my-2">
                        <label className="block text-sm font-medium text-gray-700">Attributes (optional)</label>
                        <div className="flex flex-col xsm:flex-row flex-wrap xsm:flex-nowrap gap-2 xsm:items-end">
                          <div>
                            <label htmlFor="trait-type" className="block text-sm font-medium text-gray-500">Name:</label>
                            <input
                              type="text"
                              name="trait-type"
                              id="trait-type"
                              autoComplete="off"
                              value={attributeType}
                              className="mt-1 w-44 xsm:w-full inline-block focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                              onChange={(e) => {setAttributeType(e.target.value)}}
                            />
                          </div>
                          <div>
                            <label htmlFor="trait-value" className="block text-sm font-medium text-gray-500">Value:</label>
                            <input
                              type="text"
                              name="trait-value"
                              id="trait-value"
                              autoComplete="off"
                              value={attributeValue}
                              className="mt-1 w-44 xsm:w-full inline-block focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                              onChange={(e) => {setAttributeValue(e.target.value)}}
                            />
                          </div>
                          <div>
                            <label
                              className="cursor-pointer inline-flex justify-center py-2 px-4 border border-transparent shadow-sm
                                text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline focus:outline-0"
                              onClick={handleAttributes}
                            >
                              Add
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                          {attributes.length > 0 && attributes.map((attribute, index) => {
                            return (
                              <div className="block m-2 p-2 rounded-lg shadow-lg bg-indigo-50 max-w-sm relative w-20 min-w-fit" key={index}>
                                <span
                                  className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer"
                                  onClick={() => {handleAttributeDelete(attribute)}}
                                >
                                  X
                                </span>
                                <p className="text-indigo-500 font-bold text-base text-center">
                                  {attribute['trait_type']}
                                </p>
                                <p className="text-gray-700 text-base text-center">
                                  {attribute['value']}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block border-r border-gray-200 mx-4"></div>

                    <div className="flex flex-nowrap flex-col w-full max-w-lg">
                      <div className="my-2 border">
                        {selectedImage ?
                            <Image className="" alt='nft image' src={URL.createObjectURL(selectedImage)} layout='responsive' width={6} height={4} />
                          :
                            <Image className="" alt='nft image' src={NoImageAvailable} layout='responsive' />
                        }
                      </div>
                      <div className="my-2">
                      <label className="block text-sm font-medium text-gray-500">Max: 10mb</label>
                        <input
                          type="file"
                          name="image"
                          accept=".jpg, .jpeg, .png, .gif"
                          required
                          className="
                            w-48
                            xsm:min-w-fit

                            file:cursor-pointer
                            file:inline-flex file:justify-center
                            file:py-2 file:px-4
                            file:border file:border-transparent file:shadow-sm
                            file:text-sm file:font-medium file:rounded-md file:text-white
                            file:bg-indigo-600 file:hover:bg-indigo-700
                            file:focus:outline file:focus:outline-0

                            bg-gradient-to-br from-gray-200 to-gray-400
                            text-sm text-black/80 font-medium
                            rounded-full
                            cursor-pointer
                            shadow-xl shadow-gray-400/60
                            focus:outline focus:outline-0
                          "
                          onChange={handleImage}
                        />
                      </div>
                    </div>

                  </div>

                  <div className="px-4 py-4 bg-gray-50 text-right">
                    {isLoading ?
                      <button
                        disabled
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />
                        Processing</button>
                      :
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >Create NFT!</button>
                    }
                  </div>

                </div>
              </form>
            </div>
          }

        </div>

      </div>
<div className="flex flex-row gap-2">
  <div>
    <p onClick={uploadImage}>Upload Image to IPFS</p>
    <p onClick={uploadConfig}>Upload config to IPFS</p>
    <p onClick={() => {console.log('values', values);}}>Click to see values</p>
    <p onClick={() => {Toast.info('Info Notification !')}}>Notify!</p>
    <p onClick={testBlockchain}>Test blockchain</p>
  </div>
  <div>
    <p onClick={listDbTables}>Test listDbTables</p>
    <p onClick={createDbTable}>Test createDbTable</p>
    <p onClick={statusDbTable}>Test statusDbTable</p>
    <p onClick={deleteDbTable}>Test deleteDbTable</p>
    <p onClick={scanDbTable}>Test scanDbTable</p>
  </div>
  <div>
    <p onClick={getDbItem}>Test getDbItem</p>
    <p onClick={getBatchDbItem}>Test getBatchDbItem</p>
    <p onClick={putDbItem}>Test putDbItem</p>
    <p onClick={putBatchDbItem}>Test putBatchDbItem</p>
    <p onClick={updateDbItem}>Test updateDbItem</p>
    <p onClick={deleteDbItem}>Test deleteDbItem</p>
    <p onClick={deleteBatchDbItem}>Test deleteBatchDbItem</p>
  </div>
</div>
    </main>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
