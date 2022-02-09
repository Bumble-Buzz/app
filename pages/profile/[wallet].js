import { useEffect, useState, useReducer, useRef } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import { ethers } from 'ethers';
import FormData from 'form-data';
import { useAuth } from '../../contexts/AuthContext';
import Unauthenticated from '../../components/Unauthenticated';
import PageError from '../../components/PageError';
import API from '../../components/Api';
import ContentWrapper from '../../components/wrappers/ContentWrapper';
import ButtonWrapper from '../../components/wrappers/ButtonWrapper';
import ProfileFactory from '../../components/profile/ProfileFactory';
import { ClipboardCopyIcon, UploadIcon } from '@heroicons/react/solid';
import Toast from '../../components/Toast';
import IPFS from '../../utils/ipfs';
import Lexicon from '../../lexicon/create';


const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case 'name':
      newState = JSON.parse(JSON.stringify(state));
      newState.name = action.payload.name;
      return newState
    case 'bio':
      newState = JSON.parse(JSON.stringify(state));
      newState.bio = action.payload.bio;
      return newState
    case 'picture':
      newState = JSON.parse(JSON.stringify(state));
      newState.picture = action.payload.picture;
      return newState
    case 'ALL':
      return {
        name: action.payload.name,
        bio: action.payload.bio,
        picture: action.payload.picture
      }
    default:
      return state
  }
};

export default function Create() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const [tab, setTab] = useState('wallet');
  const [walletValidity, setWalletvalidity] = useState(false);
  const inputFile = useRef(null) 
  const { data: session, status: sessionStatus } = useSession();

  const [userState, dispatch] = useReducer(reducer, {
    name: '',
    bio: '',
    picture: ''
  });

  useEffect(() => {
    if (ROUTER && ROUTER.query && ROUTER.query.wallet) {
      getUsersDb();
    }
  }, [ROUTER.query.wallet]);

  const getUsersDb = async () => {
    // console.log('getUsersDb');
    const payload = {
      TableName: "users",
      Key: {
        'walletId': ROUTER.query.wallet
      }
    };
    const results = await API.db.item.get(payload);
    // console.log('Get item:', results.data);
    if (results && results.data) {
      setWalletvalidity(true);
      dispatch({
        type: 'ALL',
        payload: {
          name: results.data.name,
          bio: results.data.bio,
          picture: results.data.picture
        } 
      });
    }
  };

  const updateUsersDb = async (e) => {
    e.preventDefault();

    const payload = {
      TableName: "users",
      Key: { 'walletId': AuthContext.state.account },
      ExpressionAttributeNames: { "#myName": "name", "#myBio": "bio" },
      UpdateExpression: `set #myName = :name, #myBio = :bio`,
      ExpressionAttributeValues: { ":name": userState.name, ":bio": userState.bio }
    };
    await API.db.item.update(payload);
  }

  const updateUsersDbPic = async (_url) => {
    const payload = {
      TableName: "users",
      Key: { 'walletId': AuthContext.state.account },
      ExpressionAttributeNames: { "#myPic": "picture" },
      UpdateExpression: `set #myPic = :picture`,
      ExpressionAttributeValues: { ":picture": _url }
    };
    await API.db.item.update(payload);
  }

  const walletClick = () => {
    Toast.info('Copied wallet ID');
    navigator.clipboard.writeText(AuthContext.state.account);
  };

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      ROUTER.query.wallet === AuthContext.state.account && AuthContext.state.isNetworkValid
    )
  };

  const triggerInputFile = () => {
    if (isSignInValid()) {
      inputFile.current.click();
    }
  };

  const handleImage = async (e) => {
    const image = e.target.files[0];
    if (image && image.size > 10485760) {
      Toast.error("Image size too big. Max 10mb");
    }

    try {
      // upload image to IPFS
      const cid = await uploadImage(image);

      // update image on page
      const validUrl = IPFS.getValidBaseUrl() + cid;
      dispatch({ type: 'picture', payload: { picture: validUrl } });

      // upload picture cid in database
      await updateUsersDbPic(validUrl);
    } catch (e) {
      dispatch({ type: 'picture', payload: { picture: '' } });
      Toast.error(e.message);
    }
  };

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("name", image.name);
    formData.append("image", image);

    let cid;
    try {
      await API.ipfs.put.image(formData).then(res => {
        cid = res.data;
      });
    } catch (e) {
      throw({ message: 'Error uploading profile image to IPFS' });
    }
    return cid;
  };


  if (!AuthContext.state.account || !AuthContext.state.isNetworkValid) {
    return (
      <Unauthenticated link={'/authenticate'}></Unauthenticated>
    )
  } else if (AuthContext.state.account && AuthContext.state.isNetworkValid && !walletValidity) {
    return (
      <PageError>Profile not found</PageError>
    )
  }

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col w-full">

        <div className="p-2">
          <h2 className="text-3xl font-semibold text-gray-800">Pro<span className="text-indigo-600">file</span></h2>
        </div>

        <div className="p-2 gap-2 flex flex-col items-center text-center">

          <div className="gap-2 flex flex-col sm:flex-row w-full">
            <div className="p-1 rounded-lg shadow-lg bg-white flex flex-col sm:flex-row items-center text-center">
              <div className="relative w-20 sm:w-32 md:w-44 lg:w-60 h-20 sm:h-32 md:h-44 lg:h-60">
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
                <Image
                  src={ userState.picture === '' ? '/person.png' : userState.picture } alt='profile' aria-hidden="true"
                  placeholder='blur' blurDataURL='/avocado.jpg' layout="fill" objectFit="contain" sizes='50vw'
                  title="Click to upload new image" onClick={triggerInputFile} className={ isSignInValid() ? "cursor-pointer" : "" }
                />
              </div>
            </div>
            <div className="block p-1 rounded-lg shadow-lg bg-white grow">
              <form onSubmit={(e) => {updateUsersDb(e)}} method="POST">
                <div className="flex flex-col md:flex-row px-4 py-4 bg-white">

                  <div className="w-full">
                    <div className="my-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        disabled={ isSignInValid() ? "" : "disabled" }
                        defaultValue={userState.name}
                        autoComplete="off"
                        className="mt-1 w-56 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        onChange={(e) => {dispatch({ type: 'name', payload: { name: e.target.value } })}}
                      />
                    </div>
                    <div className="my-2">
                      <label htmlFor="walletId" className="block text-sm font-medium text-gray-700">Wallet ID</label>
                      <div className="flex flex-row gap-2 items-center text-center">
                        <input
                          type="text"
                          name="walletId"
                          id="walletId"
                          autoComplete="off"
                          defaultValue={AuthContext.state.account}
                          disabled="disabled"
                          className="mt-1 w-48 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md truncate"
                        />
                        <ClipboardCopyIcon className="w-5 h-5 mr-2 cursor-pointer" alt="copy" title="copy" aria-hidden="true" onClick={walletClick} />
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block border-r border-gray-200 mx-4"></div>

                  <div className="w-full">
                    <div className="my-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">About me</label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        maxLength="200"
                        disabled={ isSignInValid() ? "" : "disabled" }
                        placeholder=""
                        defaultValue={userState.bio}
                        className="mt-1 w-56 xsm:w-full resize-none focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        onChange={(e) => {dispatch({ type: 'bio', payload: { bio: e.target.value } })}}
                      />
                    </div>
                  </div>

                </div>
                <div className="px-4 text-right w-full">
                  {isSignInValid() && (
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >Update
                    </button>
                  )}
                  
                </div>
              </form>
            </div>
          </div>

          <div className="px-4 gap-2 flex flex-col xsm:flex-row w-full">
            {tab === 'wallet' ?
              (<ButtonWrapper classes="grow bg-indigo-800 hover:bg-indigo-600" onClick={() => setTab('wallet')}>Wallet</ButtonWrapper>)
              :
              (<ButtonWrapper classes="grow bg-indigo-600 hover:bg-indigo-800" onClick={() => setTab('wallet')}>Wallet</ButtonWrapper>)
            }
            {tab === 'collections' ?
              (<ButtonWrapper classes="grow bg-indigo-800 hover:bg-indigo-600" onClick={() => setTab('collections')}>Collections</ButtonWrapper>)
              :
              (<ButtonWrapper classes="grow bg-indigo-600 hover:bg-indigo-800" onClick={() => setTab('collections')}>Collections</ButtonWrapper>)
            }
            {tab === 'created' ?
              (<ButtonWrapper classes="grow bg-indigo-800 hover:bg-indigo-600" onClick={() => setTab('created')}>Created</ButtonWrapper>)
              :
              (<ButtonWrapper classes="grow bg-indigo-600 hover:bg-indigo-800" onClick={() => setTab('created')}>Created</ButtonWrapper>)
            }
            {tab === 'listings' ?
              (<ButtonWrapper classes="grow bg-indigo-800 hover:bg-indigo-600" onClick={() => setTab('listings')}>Listings</ButtonWrapper>)
              :
              (<ButtonWrapper classes="grow bg-indigo-600 hover:bg-indigo-800" onClick={() => setTab('listings')}>Listings</ButtonWrapper>)
            }
          </div>

          <div className="gap-2 flex flex-col sm:flex-row w-full">
            {ProfileFactory[tab]}
          </div>

        </div>

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
