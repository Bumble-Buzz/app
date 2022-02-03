import { useEffect, useState } from 'react'
import Image from 'next/image';
import { useSession, getSession } from 'next-auth/react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import Unauthenticated from '../components/Unauthenticated';
import FilterPanel from '../components/FilterPanel';
import ContentWrapper from '../components/wrappers/ContentWrapper';
import ButtonWrapper from '../components/wrappers/ButtonWrapper';
import ProfileFactory from '../components/profile/ProfileFactory';
import Lexicon from '../lexicon/create';


export default function Create() {
  const AuthContext = useAuth();
  const [tab, setTab] = useState('wallet');
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
  }, []);



  if (!session || sessionStatus !== 'authenticated' || session.user.id !== AuthContext.state.account || !AuthContext.state.isNetworkValid) {
    return (
      <Unauthenticated link={'/authenticate'}></Unauthenticated>
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
              {/* <Image
                className="object-cover border-2 border-black-600 rounded-full"
                src={'/avocado.jpg'} alt='Profile' title="Profile" width='50' height='50'
              /> */}
              {/* <Image className="" alt='nft image' src={'/avocado.jpg'} layout='responsive' /> */}
              <img
                className="object-cover w-20 sm:w-32 md:w-44 lg:w-60 h-20 sm:h-32 md:h-44 lg:h-60 border-2 border-black-600 rounded-full"
                src={'/avocado.jpg'} alt="Profile" title="Profile"
              />
            </div>
            <div className="block p-1 rounded-lg shadow-lg bg-white grow">
              {/* <p className="text-gray-700 text-base">asdasdasd</p> */}
              <form>
                <div className="flex flex-col md:flex-row items-center px-4 py-4 bg-white">

                  <div className="w-full">
                    <div className="my-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="off"
                        className="mt-1 w-56 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        // onChange={handleName}
                      />
                    </div>
                    <div className="my-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Wallet ID</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="off"
                        placeholder={AuthContext.state.account}
                        disabled="disabled"
                        className="mt-1 w-56 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        // onChange={handleName}
                      />
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
                        placeholder=""
                        defaultValue={''}
                        className="mt-1 w-56 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                        // onChange={handleDescription}
                      />
                    </div>
                  </div>

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
            {/* <ButtonWrapper classes="grow" onClick={() => setTab('collections')}>Collections</ButtonWrapper> */}
            {/* <ButtonWrapper classes="grow" onClick={() => setTab('created')}>Created</ButtonWrapper> */}
            {/* <ButtonWrapper classes="grow" onClick={() => setTab('listings')}>Listings</ButtonWrapper> */}
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
