import { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import Image from 'next/image';
import WALLTET from '../utils/wallet';
import {DotsCircleHorizontalIcon, UploadIcon} from '@heroicons/react/solid';

import NoImageAvailable from '../public/no-image-available.png';
import AvaxTradeNftAbi from '../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';

export default function Create() {
  const [isLoading, setLoading] = useState(false);
  const [isMinted, setMinted] = useState(false);
  const [values, setValues] = useState({ category: 'Art' });
  const [transaction, setTransaction] = useState();

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    checkTransaction();
  }, [transaction]);

  const checkTransaction = async () => {
    if (transaction) {
      console.log('transaction', transaction);
      const provider = await WALLTET.getProvider();
      const txReceipt = await provider.getTransactionReceipt(transaction.hash);
      if (txReceipt && txReceipt.blockNumber) {
        console.log('txReceipt', txReceipt);
        setTransaction();
        setSelectedImage(null);
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
    // console.log('values', values);
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
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">NFT name</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
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
                              required
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
                          {/* <label
                            htmlFor="file-upload"
                            className="inline-flex justify-center py-2 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <UploadIcon className="w-5 h-5 mr-1" aria-hidden="true" />
                            Upload
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            name="myImage"
                            accept=".jpg, .jpeg, .png, .gif"
                            required
                            className="hidden"
                            onChange={(event) => {
                              console.log(event.target.files[0]);
                              setSelectedImage(event.target.files[0]);
                            }}
                          /> */}
                          <input
                            type="file"
                            name="nft-image"
                            accept=".jpg, .jpeg, .png, .gif"
                            required
                            className="
                              min-w-fit

                              file:cursor-pointer
                              file:inline-flex file:justify-center
                              file:py-2 file:px-4
                              file:border file:border-transparent file:shadow-sm
                              file:text-sm file:font-medium file:rounded-md file:text-white
                              file:bg-indigo-600 file:hover:bg-indigo-700
                              file:focus:outline-none file:focus:ring-2 file:focus:ring-offset-2 file:focus:ring-indigo-500

                              bg-gradient-to-br from-gray-200 to-gray-400
                              text-black/80
                              rounded-full
                              cursor-pointer
                              shadow-xl shadow-gray-400/60
                              focus:outline focus:outline-0
                            "
                            onChange={(event) => {
                              console.log(event.target.files[0]);
                              setSelectedImage(event.target.files[0]);
                            }}
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

            

          </div>
        </div>
      </div>
    </main>
  )
  // }
}
  