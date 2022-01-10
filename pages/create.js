import { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import Image from 'next/image';
import WALLTET from '../utils/wallet';
import {DotsCircleHorizontalIcon, UploadIcon} from '@heroicons/react/solid';

import NoImageAvailable from '../public/no-image-available.png';
import AvaxTradeNftAbi from '../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';

const FormData = require('form-data');
import API from '../components/Api';


export default function Create() {
  const [isLoading, setLoading] = useState(false);
  const [isMinted, setMinted] = useState(false);
  const [values, setValues] = useState({ category: 'Art' });
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
      console.log('txReceipt', txReceipt);
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
    const existingAttributes = attributes;
    existingAttributes.push({ 'trait_type':attributeType, 'value':attributeValue });
    setAttributes(existingAttributes);
    setAttributeType('');
    setAttributeValue('');
    const existingValues = values;
    existingValues.attributes = existingAttributes;
    setValues(existingValues);
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
    const existingValues = values;
    setSelectedImage(e.target.files[0]);
    existingValues.image = e.target.files[0];
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
    e.preventDefault();
    console.log('start - createNft');
    if (!await WALLTET.isNetworkValid()) {
      console.error('Wrong network, switch to Avalanche');
      return;
    }

    const signer = await WALLTET.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);
    try {
      setLoading(true);

      // upload image to ipfs
      ipfsUpload(e);

      const val = await contract.mint(1, values.commission);
      setTransaction(val);
      console.log('val', val);
      const balance = await contract.balanceOf(val.from);
      console.log('balance2', balance.toLocaleString(undefined,0));
      console.log('end - createNft');
    }
    catch (e) {
      console.log('Some error occurred!', e);
      setLoading(false);
    }
  };

  const ipfsUpload = async (e) => {
    console.log('start - ipfsUpload');
    e.preventDefault();

    if (!values.image) {
      throw "No image"
    }

    const formData = new FormData();
    formData.append("name", values.image.name);
    formData.append("image", values.image);

    await API.ipfsUpload(formData).then(res => {
      console.log('res', res.data);
    });

    console.log('end - ipfsUpload');
  }

  return (
    <main className="w-full flex self-start flex-col pl-4 pr-4 mt-10 mb-10">
      <div className="w-full rounded overflow-hidden shadow-lg bg-grayDark flex flex-col p-2">
        <div className="bg-grayDark" style={{minHeight: '500px'}}>
          <div className="flex flex-col w-full max-w-4xl">

            <div className="p-2">
              <h2 className="text-3xl font-semibold text-gray-800">Create <span className="text-indigo-600">NFT</span></h2>
            </div>

            {isMinted ?
              <div className="p-2">
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
              :
              <div className="p-2">
                <form onSubmit={(e) => {createNft(e)}} method="POST" className="">
                  <div className="shadow overflow-hidden rounded-md">

                    <div className="px-4 py-4 bg-white flex flex-col md:flex-row">

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
                            <option>Sports</option>
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
                        {/* <div className="my-2">
                          <h1>Upload and Display Image usign React Hook's</h1>
                        </div> */}
                        <div className="my-2">
                          {selectedImage ?
                              <Image className="" alt='nft image' src={URL.createObjectURL(selectedImage)} layout='responsive' width={6} height={4} />
                            :
                              <Image className="" alt='nft image' src={NoImageAvailable} layout='responsive' />
                          }
                        </div>
                        <div className="my-2">
                          <input
                            type="file"
                            name="nft-image"
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
                            // file:bg-gradient-to-br file:from-indigo-500 file:to-indigo-600
                            // file:px-2 file:py-2 file:m-3
                            // file:border-none
                            // file:rounded-full
                            // file:text-white
                            // file:cursor-pointer
                            // file:shadow-lg file:shadow-indigo-600
                            // file:focus:outline file:focus:outline-0
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

{/* <p onClick={ipfsUpload}>Upload Image to IPFS</p>
<p onClick={() => {console.log('values', values);}}>Click to see values</p> */}

          </div>
        </div>
      </div>
    </main>
  )
  // }
}
  