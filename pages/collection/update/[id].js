import { useEffect, useState, useReducer, useRef } from 'react';
import Image from 'next/image';
import { useSession, getSession } from 'next-auth/react';
import { ethers } from 'ethers';
import FormData from 'form-data';
import { useRouter } from 'next/router';
import IPFS from '@/utils/ipfs';
import WalletUtil from '@/components/wallet/WalletUtil';
import { useWallet } from '@/contexts/WalletContext';
import API from '@/components/Api';
import Toast from '@/components/Toast';
import NoImageAvailable from '@/public/no-image-available.png';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import Unauthenticated from '@/components/Unauthenticated';
import PageError from '@/components/PageError';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import HeadlessSwitch from '@/components/HeadlessSwitch';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon, UploadIcon, ClipboardCopyIcon } from '@heroicons/react/solid';

import CollectionItemAbi from '@/artifacts/contracts/collectionItem/CollectionItem.sol/CollectionItem.json';
import _ from 'lodash';


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
    case 'reflection':
      state.reflection = action.payload.reflection;
      return state
    case 'incentive':
      state.incentive = action.payload.incentive;
      return state
    case 'ownerIncentiveAccess':
      newState = JSON.parse(JSON.stringify(state));
      newState.image = state.image;
      newState.ownerIncentiveAccess = !newState.ownerIncentiveAccess;
      return newState
    case 'image':
      newState = JSON.parse(JSON.stringify(state));
      newState.image = action.payload.image;
      return newState
    case 'discord':
      state.social.discord.link = action.payload.discord;
      return state
    case 'twitter':
      state.social.twitter.link = action.payload.twitter;
      return state
    case 'website':
      state.social.website.link = action.payload.website;
      return state
    default:
      return state
  }
};

export default function EditCollection({ collectionDataInit }) {
  const ROUTER = useRouter();
  const WalletContext = useWallet();
  const inputFile = useRef(null) 
  const { data: session, status: sessionStatus } = useSession();

  let dbTriggered = false;
  const [blockchainResults, setBlockchainResults] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isCollectionUpdated, setCollectionUpdated] = useState(false);

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        const payload = {
          'id': Number(blockchainResults.id),
          'name': state.name,
          'contractAddress': ethers.utils.getAddress(state.address),
          'owner': WalletContext.state.account,
          'description': state.description,
          'reflection': Number(state.reflection),
          'commission': Number(state.commission),
          'incentive': Number(state.incentive),
          'ownerIncentiveAccess': blockchainResults.disableCollectionOwnerIncentiveAccess ? false : state.ownerIncentiveAccess,
          'category': state.category,
          'image': state.image,
          'social': [ state.social.discord, state.social.twitter, state.social.website ]
        };
        await blockchainResults.api(blockchainResults.id, payload);

        setCollectionUpdated(true);
        setLoading(false);
        setBlockchainResults(null);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
        setLoading(false);
      }
    })();
  }, [blockchainResults]);

  const initSocial = () => {
    if (!collectionDataInit.social || collectionDataInit.social.length === 0) return [];

    const media = {};
    const newSocial = JSON.parse(JSON.stringify(collectionDataInit.social));
    newSocial.forEach(social => {
      media[social.name] = social;
    });
    return media;
  };

  const [state, dispatch] = useReducer(reducer, {
    name: collectionDataInit ? collectionDataInit.name : '',
    description: collectionDataInit ? collectionDataInit.description : '',
    address: collectionDataInit ? collectionDataInit.contractAddress : '',
    category: collectionDataInit ? collectionDataInit.category : '',
    commission: collectionDataInit ? collectionDataInit.commission : '',
    reflection: collectionDataInit ? collectionDataInit.reflection : '',
    incentive: collectionDataInit ? collectionDataInit.incentive : '',
    ownerIncentiveAccess: collectionDataInit ? collectionDataInit.ownerIncentiveAccess : '',
    image: collectionDataInit ? collectionDataInit.image : '',
    social: collectionDataInit ? initSocial() : ''
  });


  const isSignInValid = () => session && sessionStatus === 'authenticated' && session.user.id === WalletContext.state.account && WalletContext.state.isNetworkValid;
  // catch invalids early
  if (!collectionDataInit) return (<PageError>This collection does not exist</PageError>);
  if (!isSignInValid()) return (<Unauthenticated link={'/auth/signin'}></Unauthenticated>);
  if (session.user.id !== collectionDataInit.owner) return (<PageError>You are not the collection owner</PageError>);
  if (!collectionDataInit.active) return (<PageError>This collection has been deactivated</PageError>);


  const contractFieldsModified = () => {
    return (
      state.commission !== collectionDataInit.commission ||
      state.reflection !== collectionDataInit.reflection || state.incentive !== collectionDataInit.incentive
    );
  };
  const dbFieldsModified = () => {
    const social = initSocial();
    return (
      state.name !== collectionDataInit.name || state.description !== collectionDataInit.description || state.category !== collectionDataInit.category ||
      state.image !== collectionDataInit.image || state.social.discord.link !== social.discord.link ||
      state.social.twitter.link !== social.twitter.link || state.social.website.link !== social.website.link
    );
  };

  const updateCollection = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // only update blockchain if necessary fields changed
      if (contractFieldsModified()) {
        const signer = await WalletUtil.getWalletSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS, CollectionItemAbi.abi, signer);
        // update collection in blockchain
        const val = await contract.updateCollection(
          collectionDataInit.id, state.reflection, state.commission, state.incentive, WalletContext.state.account
        );
          
        await WalletUtil.checkTransaction(val);
        
        const listener = async (id) => {
          console.log('found collection update event: ', id.toNumber());
          if (!dbTriggered && collectionDataInit.id === Number(id)) {
            dbTriggered = true;
            setBlockchainResults({ id: collectionDataInit.id, api: async (id,payload) => await API.collection.update.id(id, payload) });
            contract.off("onCollectionUpdate", listener);
          }
        };
        contract.on("onCollectionUpdate", listener);
      } else if (dbFieldsModified()) {
        setBlockchainResults({ id: collectionDataInit.id, api: async (id,payload) => await API.collection.update.id(id, payload) });
      } else {
        Toast.info('No changes, nothing to update');
        setLoading(false);
      }
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const disableOwnerIncentiveAccess = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS, CollectionItemAbi.abi, signer);

      // disable collection owner incentive access in blockchain
      const val = await contract.disableCollectionOwnerIncentiveAccess(collectionDataInit.id);
        
      await WalletUtil.checkTransaction(val);
      
      const listener = async (id) => {
        console.log('found collection owner incentive access event: ', id.toNumber());
        if (!dbTriggered && collectionDataInit.id === Number(id)) {
          dbTriggered = true;
          setBlockchainResults({
            id: collectionDataInit.id,
            disableCollectionOwnerIncentiveAccess: true,
            api: async (id,payload) => await API.collection.update.ownerincentiveaccess(id, payload)
          });
          contract.off("onCollectionOwnerIncentiveAccess", listener);
        }
      };
      contract.on("onCollectionOwnerIncentiveAccess", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const handleImage = async (e) => {
    const image = e.target.files[0];

    // user hit `cancel` or hit `esc`, so keep the old image
    if (!image) return;

    try {
      if (image && image.size > 10485760) throw({ message: 'Image size too big. Max 10mb' });

      // upload image to IPFS
      const cid = await uploadImage(image);

      // update image on page
      dispatch({ type: 'image', payload: { image: `bumblebuzz://${cid}` } });
    } catch (e) {
      Toast.error(e.message);
    }
  };

  const uploadImage = async (image) => {
    if (!state.image) throw({ message: 'Image not found' });

    const formData = new FormData();
    formData.append("name", image.name);
    formData.append("image", image);

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

  const triggerInputFile = () => {
    if (isSignInValid()) inputFile.current.click();
  };

  const contractAddressClick = () => {
    Toast.info('Copied contract address');
    navigator.clipboard.writeText(state.address);
  };


  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col p-2 w-full">

        {/* <p onClick={() => {console.log('state', state)}}>See state</p>
        <p onClick={() => {console.log('collectionDataInit', collectionDataInit)}}>See collectionDataInit</p> */}

        <div className="p-2 flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-800">Edit <span className="text-indigo-600">{collectionDataInit.name}</span> Collection</h2>
        </div>

        {isCollectionUpdated ?
          <div className="p-2 flex flex-col items-center text-center">
            <div className="">
              <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
                <p className="text-gray-700 text-base mb-4">
                  Your collection has been updated
                </p>
                <ButtonWrapper
                  classes=""
                  onClick={() => ROUTER.push(`/collection/${collectionDataInit.id}`)}
                >
                  Return to the collection
                </ButtonWrapper>
              </div>
            </div>
          </div>
          :
          <div className="p-2 flex flex-col gap-4 items-center">
            <form onSubmit={(e) => {updateCollection(e)}} method="POST" className="w-full sm:w-auto sm:max-w-xl">
              <div className="shadow overflow-hidden rounded-md">

                <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">

                  {/* banner */}
                  <div className='w-full text-center relative h-48 border'>
                    <Image
                      src={IPFS.getValidHttpUrl(state.image)}
                      placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw'
                      title="Click to upload new image" onClick={triggerInputFile} className={ isSignInValid() ? "cursor-pointer" : "" }
                    />
                    {isSignInValid() && (
                      <>
                        <input
                          type="file"
                          name="image"
                          accept=".jpg, .jpeg, .png, .gif"
                          ref={inputFile}
                          style={{display: 'none'}}
                          onChange={handleImage}
                        />
                        <UploadIcon className="w-5 h-5 mr-2 absolute right-0 bottom-0 cursor-pointer" alt="upload" title="upload" aria-hidden="true" />
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <div className="w-full">
                      <div className="my-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="off"
                          defaultValue={state.name}
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'name', payload: { name: e.target.value } })}
                        />
                      </div>

                      <div className="my-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder=""
                            defaultValue={state.description}
                            required
                            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                            onChange={(e) => dispatch({ type: 'description', payload: { description: e.target.value } })}
                          />
                        <p className="mt-2 text-sm text-gray-500">Brief description of your collection</p>
                      </div>
                      <div className="my-2">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">{Lexicon.form.category.text}</label>
                        <select
                          id="category"
                          name="category"
                          autoComplete="category-name"
                          defaultValue={state.category}
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'category', payload: { category: e.target.value } })}
                        >
                          <option>{Lexicon.form.category.art}</option>
                          <option>{Lexicon.form.category.games}</option>
                          <option>{Lexicon.form.category.meme}</option>
                          <option>{Lexicon.form.category.photography}</option>
                          <option>{Lexicon.form.category.sports}</option>
                          <option>{Lexicon.form.category.nsfw}</option>
                          <option>{Lexicon.form.category.other}</option>
                        </select>
                      </div>
                    </div>

                    <div className="hidden sm:block border-r border-gray-200 mx-4"></div>

                    <div className="w-full">
                      <div className="my-2">
                        <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          name="commission"
                          id="commission"
                          defaultValue={state.commission}
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'commission', payload: { commission: Number(e.target.value) } })}
                        />
                      </div>

                      <div className="my-2">
                        <label htmlFor="reflection" className="block text-sm font-medium text-gray-700">Reflection</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          name="reflection"
                          id="reflection"
                          defaultValue={state.reflection}
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'reflection', payload: { reflection: Number(e.target.value) } })}
                        />
                      </div>

                      <div className="my-2">
                        <label htmlFor="incentive" className="block text-sm font-medium text-gray-700">Incentive</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          name="incentive"
                          id="incentive"
                          defaultValue={state.incentive}
                          required
                          className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                          onChange={(e) => dispatch({ type: 'incentive', payload: { incentive: Number(e.target.value) } })}
                        />
                      </div>

                      <div className="my-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Contract Address</label>
                        <div className="flex flex-row gap-2 items-center text-center">
                          <input
                            type="text"
                            name="address"
                            id="address"
                            autoComplete="off"
                            value={state.address}
                            disabled="disabled"
                            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md truncate"
                          />
                          <ClipboardCopyIcon className="w-5 h-5 cursor-pointer" alt="copy" title="copy" aria-hidden="true" onClick={contractAddressClick} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="my-2">
                      <label htmlFor="discord" className="block text-sm font-medium text-gray-700">Discord (optional)</label>
                      <input
                        type="url"
                        name="discord"
                        id="discord"
                        autoComplete="off"
                        placeholder="http://example.com"
                        defaultValue={(state.social && state.social.discord) ? state.social.discord.link : ''}
                        className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        onChange={(e) => dispatch({ type: 'discord', payload: { discord: e.target.value } })}
                      />
                    </div>
                    <div className="my-2">
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">Twitter (optional)</label>
                      <input
                        type="url"
                        name="twitter"
                        id="twitter"
                        autoComplete="off"
                        placeholder="http://example.com"
                        defaultValue={(state.social && state.social.twitter) ? state.social.twitter.link : ''}
                        className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        onChange={(e) => dispatch({ type: 'twitter', payload: { twitter: e.target.value } })}
                      />
                    </div>
                    <div className="my-2">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website (optional)</label>
                      <input
                        type="url"
                        name="website"
                        id="website"
                        autoComplete="off"
                        placeholder="http://example.com"
                        defaultValue={(state.social && state.social.website) ? state.social.website.link : ''}
                        className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        onChange={(e) => dispatch({ type: 'website', payload: { website: e.target.value } })}
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
                      >Update</button>
                    }
                  </div>
                </div>

              </div>
            </form>
            {collectionDataInit.ownerIncentiveAccess && (
              <form onSubmit={(e) => {disableOwnerIncentiveAccess(e)}} method="POST" className="w-full sm:w-auto sm:max-w-xl">
                <div className="shadow overflow-hidden rounded-md">

                  <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">
                    <div className='text-center'>
                      You have direct access to the incentive pool for this collection. You have an option to revoke this access.
                      <br />
                      You can only revoke access, and you will never be able to gain access again.
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
                        >Revoke</button>
                      }
                    </div>
                  </div>

                </div>
              </form>
            )}
          </div>
        }

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.collection.id(context.query.id);
  return {
    props: {
      collectionDataInit: data.Items[0] || null,
      session: await getSession(context)
    },
  }
}
