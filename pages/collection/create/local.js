import { useEffect, useState, useReducer } from 'react';
import _ from 'lodash';
import Image from 'next/image';
import { useSession, getSession } from 'next-auth/react';
import { ethers } from 'ethers';
import FormData from 'form-data';
import WalletUtil from '../../../components/wallet/WalletUtil';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import API from '../../../components/Api';
import Toast from '../../../components/Toast';
import NoImageAvailable from '../../../public/no-image-available.png';
import ButtonWrapper from '../../../components/wrappers/ButtonWrapper';
import Unauthenticated from '../../../components/Unauthenticated';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';
import ContentWrapper from '../../../components/wrappers/ContentWrapper';
import HeadlessSwitch from '../../../components/HeadlessSwitch';
import Lexicon from '../../../lexicon/create';

import AvaxTradeAbi from '../../../artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case 'name':
      state.name = action.payload.name;
      return state
    case 'description':
      state.description = action.payload.description;
      return state
    case 'address':
      state.address = ethers.utils.getAddress(action.payload.address);
      return state
    case 'image':
      newState = JSON.parse(JSON.stringify(state));
      newState.image = action.payload.value;
      return newState
    case 'clear':
      return {
        name: '',
        description: '',
        address: process.env.NEXT_PUBLIC_SAMPLE_NFT_CONTRACT_ADDRESS,
        image: null
      }
    default:
      return state
  }
};

export default function Local() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  let dbTriggered = false;
  const [isLoading, setLoading] = useState(false);
  const [blockchainResults, setBlockchainResults] = useState(null);
  const [isCollectionCreated, setCollectionCreated] = useState(false);

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        // upload image to ipfs
        const imageCid = await uploadImage();

        const payload = {
          'id': Number(blockchainResults.id),
          'contractAddress': ethers.utils.getAddress(state.address),
          'name': state.name,
          'description': state.description,
          'owner': AuthContext.state.account,
          'image': `ipfs://${imageCid}`,
        };
        await API.collection.create.local(payload);

        dispatch({ type: 'clear' });
        setCollectionCreated(true);
        setLoading(false);
        setBlockchainResults(null);
      } catch (e) {
        Toast.error(e.message);
        setLoading(false);
      }
    })();
  }, [blockchainResults]);

  const [state, dispatch] = useReducer(reducer, {
    name: '',
    description: '',
    address: process.env.NEXT_PUBLIC_SAMPLE_NFT_CONTRACT_ADDRESS,
    image: null
  });


  const addCollection = async (e) => {
    e.preventDefault();

    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);
    try {
      setLoading(true);

      // add collection in blockchain
      const val = await contract.createLocalCollection(state.name, state.address);

      const txReceipt = await WalletUtil.checkTransaction(val);
      if (txReceipt && txReceipt.blockNumber) {
        contract.on("onCollectionCreate", async (owner, contractAddress, collectionType, id) => {
          console.log('found event: ', owner, contractAddress, collectionType, id.toNumber());
          if (!dbTriggered && session.user.id === owner && state.address === ethers.utils.getAddress(contractAddress)) {
            dbTriggered = true;
            setBlockchainResults({ owner, contractAddress, collectionType, id });
          }
        });
      }
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const uploadImage = async () => {
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


  if (!session || sessionStatus !== 'authenticated' || session.user.id !== AuthContext.state.account || !AuthContext.state.isNetworkValid) {
    return (
      <Unauthenticated link={'/authenticate'}></Unauthenticated>
    )
  }

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col p-2 w-full">

        <div className="p-2 flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-800">Create <span className="text-indigo-600">Local</span> Collection</h2>
        </div>

        {isCollectionCreated ?
          <div className="p-2 flex flex-col items-center text-center">
            <div className="">
              <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
                <p className="text-gray-700 text-base mb-4">
                  You have successfully sent a request to add your collection to the marketplace.
                </p>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {setCollectionCreated(false);}}
                >
                  Add another collection
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
            <form onSubmit={(e) => {addCollection(e)}} method="POST" className="">
              <div className="shadow overflow-hidden rounded-md">

                <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">

                  <div className="flex flex-col md:flex-row">
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
                          onChange={(e) => dispatch({ type: 'name', payload: { name: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div className="hidden md:block border-r border-gray-200 mx-4"></div>

                    <div className="w-full">
                      <div className="my-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder=""
                            defaultValue={''}
                            required
                            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                            onChange={(e) => dispatch({ type: 'description', payload: { description: e.target.value } })}
                          />
                        <p className="mt-2 text-sm text-gray-500">Brief description of your collection</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-nowrap flex-col w-full max-w-lg">
                    <div className='relative h-48 sm:h-60'>
                      {state.image ?
                        <Image
                          className="" alt='nft image' src={URL.createObjectURL(state.image)}
                          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw'
                        />
                      :
                        <Image
                          className="" alt='nft image' src={NoImageAvailable}
                          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw'
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
                      >Create</button>
                    }
                  </div>
                </div>

              </div>
            </form>
          </div>
        }

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
