import { useEffect, useState, useReducer, useRef } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import FormData from 'form-data';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import Unauthenticated from '@/components/Unauthenticated';
import PageError from '@/components/PageError';
import API from '@/components/Api';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import ProfileFactory from '@/components/profile/ProfileFactory';
import Toast from '@/components/Toast';
import IPFS from '@/utils/ipfs';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon, ClipboardCopyIcon, UploadIcon } from '@heroicons/react/solid';


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
    case 'wallet':
      newState = JSON.parse(JSON.stringify(state));
      newState.wallet = action.payload.wallet;
      return newState
    case 'picture':
      newState = JSON.parse(JSON.stringify(state));
      newState.picture = action.payload.picture;
      return newState
    case 'ALL':
      return {
        name: action.payload.name,
        bio: action.payload.bio,
        wallet: action.payload.wallet,
        picture: action.payload.picture
      }
    default:
      return state
  }
};

export default function Wallet({ userDataInit }) {
  const ROUTER = useRouter();
  const AuthContext = useAuth();

  const [isLoading, setLoading] = useState(false);
  const [tab, setTab] = useState(ROUTER.query.tab || 'general');
  const [walletValidity, setWalletvalidity] = useState(null);
  const inputFile = useRef(null) 
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (ROUTER.query.tab) setTab(ROUTER.query.tab);
  }, [ROUTER.query.tab]);

  // swr call to fetch initial data
  const {data: userData} = useSWR(API.swr.user.id(ROUTER.query.wallet), API.swr.fetcher, {
    fallbackData: userDataInit,
    ...API.swr.options
  });
  const {data: walletInit} = useSWR(API.swr.asset.created(ROUTER.query.wallet, 'null', 20), API.swr.fetcher, API.swr.options);
  const {data: collectionInit} = useSWR(API.swr.collection.owned(ROUTER.query.wallet, 'null', 20), API.swr.fetcher, API.swr.options);
  const {data: createdInit} = useSWR(API.swr.asset.created(ROUTER.query.wallet, 'null', 20), API.swr.fetcher, API.swr.options);

  const [userState, dispatch] = useReducer(reducer, {
    name: '',
    bio: '',
    wallet: '',
    picture: ''
  });

  useEffect(() => {
    if (userData && userData.Item) {
      setWalletvalidity(true);
      dispatch({
        type: 'ALL',
        payload: {
          name: userData.Item.name,
          bio: userData.Item.bio,
          wallet: userData.Item.walletId,
          picture: userData.Item.picture
        }
      });
    } else {
      setWalletvalidity(false);
    }
  }, [userData]);


  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      AuthContext.state.isNetworkValid
    )
  };
  const isProfileOwner = () => {
    return (session.user.id === ROUTER.query.wallet)
  };
  const isProfileOwnerSignedIn = () => {
    return (isSignInValid() && isProfileOwner())
  };
  const isUserAdmin = () => {
    return (isProfileOwnerSignedIn() && AuthContext.state.account === process.env.NEXT_PUBLIC_ADMIN_WALLET_ID)
  };

  // catch invalids early
  if (walletValidity === null) return (<PageError>Loading...</PageError>);
  if (walletValidity === false) return (<PageError>Profile not found</PageError>);


  const updateUsersDb = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        TableName: "users",
        Key: { 'walletId': AuthContext.state.account },
        ExpressionAttributeNames: { "#myName": "name", "#myBio": "bio" },
        UpdateExpression: `set #myName = :name, #myBio = :bio`,
        ExpressionAttributeValues: { ":name": userState.name, ":bio": userState.bio }
      };
      await API.db.item.update(payload);

      Toast.success('Profile info updated successfully');
      setLoading(false);
    } catch (e) {
      console.error(e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const updateUsersDbPic = async (_url) => {
    const payload = {
      TableName: "users",
      Key: { 'walletId': AuthContext.state.account },
      ExpressionAttributeNames: { "#myPic": "picture" },
      UpdateExpression: `set #myPic = :picture`,
      ExpressionAttributeValues: { ":picture": _url }
    };
    await API.db.item.update(payload);
  };

  const triggerInputFile = () => {
    if (isProfileOwnerSignedIn()) {
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

      Toast.success('Profile picture updated successfully');
    } catch (e) {
      dispatch({ type: 'picture', payload: { picture: '' } });
      console.error(e);
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

  const updateTab = async (tab) => {
    setTab(tab);
    ROUTER.push({
      pathname: ROUTER.query.wallet,
      query: { tab: tab }
    },
    undefined, { shallow: true }
    )
  };

  const walletClick = () => {
    Toast.info('Copied wallet ID');
    navigator.clipboard.writeText(userState.wallet);
  };

  const updateButton = () => {
    if (!isProfileOwnerSignedIn()) return;

    if (isLoading) {
      return (
        <ButtonWrapper disabled type="submit" classes="">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />
          {Lexicon.form.submit.processing}
        </ButtonWrapper>
      )
    } else {
      return (<ButtonWrapper type="submit" classes="">Update</ButtonWrapper>) 
    }
  };

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col w-full">

        {/* <p onClick={() => {console.log('userData', userData)}}>See userData</p> */}
        {/* <p onClick={() => {console.log('userState', userState)}}>See userState</p> */}
        {/* <p onClick={() => ROUTER.push('/profile/0xdA121aB48c7675E4F25E28636e3Efe602e49eec6')}>user 0xdA121aB48c7675E4F25E28636e3Efe602e49eec6</p> */}
        {/* <p onClick={() => ROUTER.push('/profile/0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED')}>user 0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED</p> */}
        {/* <p onClick={() => {console.log('tab', tab)}}>See tab</p> */}
        {/* <p onClick={() => {console.log('ROUTER.query.tab', ROUTER.query.tab)}}>See ROUTER.query.tab</p> */}

        <div className="p-2">
          <h2 className="text-3xl font-semibold text-gray-800">Pro<span className="text-indigo-600">file</span></h2>
        </div>

        <div className="p-2 gap-2 flex flex-col items-center text-center">

          <div className="gap-2 flex flex-col sm:flex-row w-full">
            <div className="p-1 rounded-lg shadow-lg bg-white flex flex-col sm:flex-row items-center text-center">
              <div className="relative w-20 sm:w-32 md:w-44 lg:w-60 h-20 sm:h-32 md:h-44 lg:h-60">
                <Image
                  src={ userState.picture === '' ? '/person.png' : userState.picture } alt='profile' aria-hidden="true"
                  placeholder='blur' blurDataURL='/avocado.jpg' layout="fill" objectFit="contain" sizes='50vw'
                  title={isProfileOwnerSignedIn() ? "Click to upload new image" : "Profile picture"}
                  onClick={triggerInputFile} className={ isProfileOwnerSignedIn() ? "cursor-pointer" : "" }
                />
                {isProfileOwnerSignedIn() && (
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
                        disabled={ isProfileOwnerSignedIn() ? "" : "disabled" }
                        value={userState.name}
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
                          value={userState.wallet}
                          disabled="disabled"
                          className="mt-1 w-48 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md truncate"
                        />
                        <ClipboardCopyIcon className="w-5 h-5 cursor-pointer" alt="copy" title="copy" aria-hidden="true" onClick={walletClick} />
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
                        disabled={ isProfileOwnerSignedIn() ? "" : "disabled" }
                        placeholder=""
                        value={userState.bio}
                        className="mt-1 w-56 xsm:w-full resize-none focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        onChange={(e) => {dispatch({ type: 'bio', payload: { bio: e.target.value } })}}
                      />
                    </div>
                  </div>

                </div>
                <div className="px-4 text-right w-full">
                  {updateButton()}
                </div>
              </form>
            </div>
          </div>

          <div className="px-4 gap-2 flex flex-row flex-wrap items-center text-center">
              {tab === 'general' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('general')}>General</button>)
                :
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => updateTab('general')}>General</button>)
              }
              {tab === 'wallet' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('wallet')}>Wallet</button>)
                :
                  (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => updateTab('wallet')}>Wallet</button>)
              }
              {tab === 'collections' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('collections')}>Collections</button>)
                :
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => updateTab('collections')}>Collections</button>)
              }
              {tab === 'created' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('created')}>Created</button>)
                :
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => updateTab('created')}>Created</button>)
              }
              {tab === 'listings' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('listings')}>Listings</button>)
                :
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => updateTab('listings')}>Listings</button>)
              }
              {isUserAdmin() && (
                tab === 'admin' ?
                  (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('admin')}>Admin</button>)
                  :
                  (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => updateTab('admin')}>Admin</button>)
              )}
          </div>

          <div className="gap-2 flex flex-col w-full">
            {tab === 'general' && ProfileFactory[tab]()}
            {tab === 'wallet' && ProfileFactory[tab]({ initialData: walletInit })}
            {tab === 'collections' && ProfileFactory[tab]({ initialData: collectionInit })}
            {tab === 'created' && ProfileFactory[tab]({ initialData: createdInit })}
            {tab === 'listings' && ProfileFactory[tab]({ initialData: {} })}
            {tab === 'admin' && ProfileFactory[tab]({ initialData: {} })}
            {/* {tab === 'listings' && ProfileFactory[tab]({ initialData: contracts })} */}
          </div>

        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.user.id(context.query.wallet);
  return {
    props: {
      userDataInit: data,
      session: await getSession(context)
    },
  }
}
