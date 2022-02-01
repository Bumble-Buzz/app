import Image from 'next/image';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useSession, getSession, getProviders, signIn, signOut } from 'next-auth/react';
import Toast from '../components/Toast';
import WalletUtil from '../components/wallet/WalletUtil';

import { useAuth, AUTH_CONTEXT_ACTIONS } from '../contexts/AuthContext'


export default function SignIn() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  const walletConnect = async () => {
    await WalletUtil.reqAccountLogin();
  };

  const handleSignIn = async () => {
    const domain = {
      name: 'AvaxTrade',
      version: '1',
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      verifyingContract: '0x1111111111111111111111111111111111111111', // contract address
      salt: '0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558'
    };
    const types = {
      auth: [
        { name: 'content', type: 'string' },
        { name: 'user', type: 'user' }
      ],
      user: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
      ]
    };
    const value = {
      content: 'User Authentication',
      user: {
        name: 'Anon',
        wallet: AuthContext.state.account
      },
    };

    try {
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner();
      const signature = await signer._signTypedData(domain, types, value);
      // const expectedSignerAddress = await signer.getAddress();
      const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, signature);


      const providers = await getProviders();
      const signedIn = await signIn(providers.myCredentials.id, {
        redirect: false,
        walletId: AuthContext.state.account,
        signature,
        recoveredAddress
      });
      if (signedIn && signedIn.ok) {
        ROUTER.back();
      } else {
        Toast.error('Authentication failed, incorrect credentials');
      }
    } catch (e) {
      Toast.error('Authentication failed');
      console.error(e);
    }
    
  };

  const handleSignOut = async () => {
    signOut({redirect: false});
    ROUTER.back();
  };


  if (session && sessionStatus === 'authenticated') {
    return (
      <div className="flex flex-nowrap flex-col items-center px-0 py-1 w-full">
        <div className="flex flex-nowrap rounded shadow-lg w-full" style={{minHeight: '500px'}}>

          {/* Page Content */}
          <div className="flex flex-col p-2 w-full">

            <div className="p-2 flex flex-col">
              <h2 className="text-3xl font-semibold text-gray-800">Sign<span className="text-indigo-600">Out</span></h2>
            </div>

            <div className="p-2 flex flex-col items-center text-center">
              <div className="block p-6 rounded-lg shadow-lg bg-white max-w-md">
                <p className="text-gray-700 text-base mb-4">
                  Would you like to sign out?
                </p>
                <button
                  type="button"
                  className="inline-flex justify-center mx-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => ROUTER.back()}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center mx-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    )
  } else {
    return (
      <div className="flex flex-nowrap flex-col items-center px-0 py-1 w-full">
        <div className="flex flex-nowrap rounded shadow-lg w-full" style={{minHeight: '500px'}}>

          {/* Page Content */}
          <div className="flex flex-col p-2 w-full">

            <div className="p-2 flex flex-col">
              <h2 className="text-3xl font-semibold text-gray-800">Sign<span className="text-indigo-600">In</span></h2>
            </div>

            <div className="p-2 flex flex-col items-center text-center">
              <div className="block p-6 rounded-lg shadow-lg bg-white max-w-md">

                {!AuthContext.state.isWalletFound && (
                  <p className="text-gray-700 text-base mb-4">No Web3 wallet found</p>
                )}
                {!AuthContext.state.isMetamaskFound && (
                  <p className="text-gray-700 text-base mb-4">No MetaMask wallet found</p>
                )}
                {AuthContext.state.isWalletFound && AuthContext.state.isMetamaskFound && (
                  <Image src={'/metamask.svg'} alt='avocado' width='200' height='200' />
                )}
                {/* {!AuthContext.state.isConnected && (
                  <p className="text-gray-700 text-base mb-4">MetaMask is not connected to any chain</p>
                )} */}
                {!AuthContext.state.isNetworkValid && (
                  <p className="text-gray-700 text-base mb-4">MetaMask is not connected to Avalanche chain</p>
                )}
                {!AuthContext.state.account && (
                  <>
                    <p className="text-gray-700 text-base mb-4">No account is connected.</p>
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={walletConnect}
                    >
                      Connect using Metamask
                    </button>
                  </>
                )}

                {AuthContext.state.isWalletFound && AuthContext.state.isMetamaskFound && AuthContext.state.isNetworkValid && AuthContext.state.account && (
                  <>
                    <p className="text-gray-700 text-base m-4">Sign in using account: {AuthContext.state.account}</p>
                    {/* <form name="form" onSubmit={(e) => {authenticate(e)}} method="post" action="/api/auth/callback/credentials">
                      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                      <input name="walletId" type="hidden" defaultValue={AuthContext.state.account} />
                      <input name="data" type="hidden" defaultValue='' />
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Sign in
                      </button>
                    </form> */}
                    {/* {console.log('providers.credentials.id', providers)} */}
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={handleSignIn}
                    >
                      Sign in
                    </button>
                  </>
                )}


              </div>
            </div>

          </div>

        </div>
      </div>
    )
  }
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
