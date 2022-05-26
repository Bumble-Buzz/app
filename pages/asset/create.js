import { useEffect, useState, useReducer } from 'react'
import Image from 'next/image';
import { useSession, getSession } from 'next-auth/react';
import { ethers } from 'ethers';
import FormData from 'form-data';
import { useRouter } from 'next/router';
import WalletUtil from '@/components/wallet/WalletUtil';
import { useWallet } from '@/contexts/WalletContext';
import API from '@/components/Api';
import Toast from '@/components/Toast';
import NoImageAvailable from '@/public/no-image-available.png';
import Unauthenticated from '@/components/Unauthenticated';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeNftAbi from '@/artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function Create() {
  const ROUTER = useRouter();
  const WalletContext = useWallet();
  const { data: session, status: sessionStatus } = useSession();

  let dbTriggered = false;
  const [isLoading, setLoading] = useState(false);
  const [blockchainResults, setBlockchainResults] = useState(null);
  const [isMinted, setMinted] = useState(false);
  const [attributeType, setAttributeType] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  const reducer = (state, action) => {
    let newState;
    switch(action.type) {
      case 'name':
        state.name = action.payload.name;
        return state
      case 'description':
        state.description = action.payload.description;
        return state
      case 'category':
        state.category = action.payload.category;
        return state
      case 'commission':
        state.commission = action.payload.commission;
        return state
      case 'attributes':
        newState = JSON.parse(JSON.stringify(state));
        newState.image = state.image;
        if (attributeType.length > 0) {
          newState.attributes.push({ 'trait_type': attributeType, 'value': attributeValue });
        }
        setAttributeType('');
        setAttributeValue('');
        return newState
      case 'attributesDelete':
        newState = JSON.parse(JSON.stringify(state));
        newState.image = state.image;
        newState.attributes = newState.attributes.filter(
          attribute => attribute['trait_type'] !== action.payload.value['trait_type']
        );
        return newState
      case 'image':
        newState = JSON.parse(JSON.stringify(state));
        newState.image = action.payload.value;
        return newState
      case 'clear':
        return {
          name: '',
          description: '',
          category: 'Art',
          commission: '',
          attributes: [],
          image: null
        }
      default:
        return state
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    name: '',
    description: '',
    category: 'Art',
    commission: '',
    attributes: [],
    image: null
  });

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        const payload = {
          'contractAddress': process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
          'tokenId': Number(blockchainResults.tokenId),
          'collectionId': Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID),
          'commission': Number(state.commission),
          'creator': blockchainResults.owner,
          'owner': blockchainResults.owner,
          'config': blockchainResults.config
        };
        await API.asset.create(payload);

        dispatch({ type: 'clear' });
        setMinted(true);
        setLoading(false);
        setBlockchainResults(null);
      } catch (e) {
        console.log('e', e);
        Toast.error(e.message);
        setLoading(false);
      }
    })();
  }, [blockchainResults]);

  const createNft = async (e) => {
    e.preventDefault();

    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);
    try {
      setLoading(true);

      // upload image to ipfs
      const imageCid = await uploadImage();

      // upload config to ipfs
      const config = {
        name: state.name,
        description: state.description,
        image: `bumblebuzz://${imageCid}`,
        // imageHttp: `https://ipfs.io/ipfs/${imageCid}`,
        attributes: state.attributes
      };
      const configCid = await uploadConfig(config);
      console.log('configCid:', configCid);

      const listener = async (owner, tokenId) => {
        console.log('found create event: ', owner, tokenId.toNumber());
        if (!dbTriggered && session.user.id === owner) {
          dbTriggered = true;
          setBlockchainResults({ owner, tokenId, config });
          contract.off("onNftMint", listener);
        }
      };
      contract.on("onNftMint", listener);

      // mint NFT in blockchain
      const transaction = await contract.mint(
        state.commission,
        configCid,
        { value: ethers.utils.parseEther('0.0') }
      );
      await transaction.wait();
      console.log('end');
    } catch (e) {
      console.log('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!state.image) throw({ message: 'Image not found' });

    const formData = new FormData();
    formData.append("name", state.image.name);
    formData.append("image", state.image);

    let cid;
    try {
      await API.ipfs.put.image(formData).then(res => {
        cid = res.data;
      });
    } catch (e) {
      throw({ message: 'Error uploading image to IPFS' });
    }

    return cid;
  };

  const uploadConfig = async (_payload) => {
    let cid;
    try {
      await API.ipfs.put.config(_payload).then(res => {
        cid = res.data;
      });
    } catch (e) {
      throw({ message: 'Error uploading config to IPFS' });
    }

    return cid;
  };



  const testBlockchain = async () => {
    console.log('start - testBlockchain');

    const provider = await WalletUtil.getWalletProvider();

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


  if (!session || sessionStatus !== 'authenticated' || session.user.id !== WalletContext.state.account || !WalletContext.state.isNetworkValid) {
    return (
      <Unauthenticated link={'/auth/signin'}></Unauthenticated>
    )
  }

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col p-2 w-full">

        <div className="p-2 flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-800">{Lexicon.title} <span className="text-indigo-600">{Lexicon.title2}</span></h2>
        </div>

        {isMinted ?
          <div className="p-2 flex flex-col items-center text-center">
            <div className="">
              <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
                <p className="text-gray-700 text-base mb-4">{Lexicon.congratulations}</p>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {setMinted(false);}}
                >
                  {Lexicon.createAnotherNft}
                </button>
                <br /><br />
                <ButtonWrapper
                  classes=""
                  onClick={() => ROUTER.back()}
                >
                  Return to previous page
                </ButtonWrapper>
              </div>
            </div>
          </div>
          :
          <div className="p-2 flex flex-col items-center">
            <form onSubmit={(e) => {createNft(e)}} method="POST" className="">
              <div className="shadow overflow-hidden rounded-md">

                <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">

                  <div className="flex flex-col md:flex-row">
                    <div className="w-full">
                      <div className="my-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{Lexicon.form.name}</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="off"
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'name', payload: { name: e.target.value } })}
                        />
                      </div>

                      <div className="my-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{Lexicon.form.description.text}</label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder=""
                            defaultValue={''}
                            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                            onChange={(e) => dispatch({ type: 'description', payload: { description: e.target.value } })}
                          />
                        <p className="mt-2 text-sm text-gray-500">{Lexicon.form.description.text2}</p>
                      </div>
                    </div>

                    <div className="hidden md:block border-r border-gray-200 mx-4"></div>

                    <div className="w-full">
                      <div className="my-2">
                        <label htmlFor="commission" className="block text-sm font-medium text-gray-700">{Lexicon.form.commission}</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          name="commission"
                          id="commission"
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'commission', payload: { commission: e.target.value } })}
                        />
                      </div>

                      <div className="my-2">
                        <label className="block text-sm font-medium text-gray-700">{Lexicon.form.attributes.text}</label>
                        <div className="flex flex-col xsm:flex-row flex-wrap xsm:flex-nowrap gap-2 xsm:items-end">
                          <div>
                            <label htmlFor="trait-type" className="block text-sm font-medium text-gray-500">{Lexicon.form.attributes.name}</label>
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
                            <label htmlFor="trait-value" className="block text-sm font-medium text-gray-500">{Lexicon.form.attributes.value}</label>
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
                              onClick={() => dispatch({ type: 'attributes' })}
                            >
                              {Lexicon.form.attributes.add}
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                          {state.attributes && state.attributes.length > 0 && state.attributes.map((attribute, index) => {
                            return (
                              <div className="block m-2 p-2 rounded-lg shadow-lg bg-indigo-50 max-w-sm relative w-20 min-w-fit" key={index}>
                                <span
                                  className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer"
                                  onClick={() => dispatch({ type: 'attributesDelete', payload: { value: attribute } })}
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
                  </div>

                  <div className="flex flex-nowrap flex-col">
                    <div className='relative h-24 sm:h-30 md:h-40 border border-1'>
                      {state.image ?
                        <Image
                          className="" alt='nft image' src={URL.createObjectURL(state.image)}
                          placeholder='blur' blurDataURL='/avocado.jpg' layout="fill" objectFit="contain" sizes='50vw'
                        />
                      :
                        <Image
                          className="" alt='nft image' src={NoImageAvailable}
                          placeholder='blur' blurDataURL='/avocado.jpg' layout="fill" objectFit="cover" sizes='50vw'
                        />
                      }
                    </div>
                    <div className="my-2">
                      <label className="block text-sm font-medium text-gray-500">{Lexicon.form.image.limit}</label>
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
                        onChange={(e) => {
                          const image = e.target.files[0];
                          if (image && image.size > 10485760) {
                            Toast.error("Image size too big. Max 10mb");
                            dispatch({ type: 'image', payload: { value: null } });
                          } else {
                            dispatch({ type: 'image', payload: { value: image } });
                          }
                        }}
                      />
                    </div>
                  </div>

                </div>

                <div className="flex flex-row items-center justify-between gap-2 px-4 py-4 bg-gray-50 text-right">
                  <div>
                    <ButtonWrapper
                      classes=""
                      onClick={() => ROUTER.back()}
                    >
                      Back
                    </ButtonWrapper>
                  </div>
                  <div>
                    {isLoading ?
                      <button
                        disabled
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />
                        {Lexicon.form.submit.processing}</button>
                      :
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >{Lexicon.form.submit.createNft}</button>
                    }
                  </div>
                </div>

              </div>
            </form>
          </div>
        }
{/* <div className="flex flex-row gap-2">
  <div>
    <p onClick={uploadImage}>Upload Image to IPFS</p>
    <p onClick={uploadConfig}>Upload config to IPFS</p>
    <p onClick={() => {console.log('state', state);}}>Click to see state</p>
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
</div> */}
      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
