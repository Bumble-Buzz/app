import Image from 'next/image';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useSession, getSession, getProviders, signIn, signOut } from 'next-auth/react';
import API from '../components/Api';
import Toast from '../components/Toast';
import WalletUtil from '../components/wallet/WalletUtil';
import { useAuth } from '../contexts/AuthContext';
import ContentWrapper from '../components/wrappers/ContentWrapper';


const initTableSetup = async () => {
  console.log('start - initTableSetup');

  const payload = {
    TableName: "users",
    AttributeDefinitions: [
      {
        AttributeName: "walletId",
        AttributeType: "S",
      }
    ],
    KeySchema: [
      {
        AttributeName: "walletId",
        KeyType: "HASH",
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await API.db.table.create(payload);
  console.log('Created:', results.data);

  console.log('end - initTableSetup');
}

export default function SignIn() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  const walletConnect = async () => {
    await WalletUtil.reqAccountLogin();
  };

  const getUsersDb = async () => {
    const payload = {
      TableName: "users",
      Key: {
        'walletId': AuthContext.state.account
      }
    };
    const results = await API.db.item.get(payload);
    return results.data;
  };

  const putUsersDb = async () => {
    const payload = {
      TableName: "users",
      Item: {
        'walletId': AuthContext.state.account,
        'name': 'Anon',
        'bio': '',
        'picture': '',
        'timestamp': ''
      }
    };
    await API.db.item.put(payload);
  };

  const usersDb = async () => {
    const data = await getUsersDb();
    if (data) {
      console.log('user exists, do nothing. or update timestamp?');
    } else {
      await putUsersDb();
    }
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
      const signer = await WalletUtil.getWalletSigner();
      const signature = await signer._signTypedData(domain, types, value);
      const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, signature);

      const CredProviders = await getProviders();
      const signedIn = await signIn(CredProviders.myCredentials.id, {
        redirect: false,
        walletId: AuthContext.state.account,
        signature,
        recoveredAddress
      });
      if (signedIn && signedIn.ok) {
        await usersDb();
        ROUTER.back();
      } else {
        throw('Authentication failed, incorrect credentials')
      }
    } catch (e) {
      signOut({redirect: false});
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
      <ContentWrapper>
        {/* Page Content */}
        <div className="flex flex-col p-2 w-full">

          <div className="p-2 flex flex-col">
            <h2 className="text-3xl font-semibold text-gray-800">Sign<span className="text-indigo-600">Out</span></h2>
          </div>

          <div className="p-2 flex flex-col items-center text-center">
            <div className="block p-6 rounded-lg shadow-lg bg-white">
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
      </ContentWrapper>
    )
  } else {
    return (
      <ContentWrapper>
        {/* Page Content */}
        <div className="flex flex-col p-2 w-full">

          <div className="p-2 flex flex-col">
            <h2 className="text-3xl font-semibold text-gray-800">Sign<span className="text-indigo-600">In</span></h2>
          </div>

          <div className="p-2 flex flex-col items-center text-center">
            <div className="block p-6 rounded-lg shadow-lg bg-white">

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
                  <div className="text-gray-700 text-base break-all">Sign in using account:</div>
                  <div className="text-gray-700 text-base break-all mb-4"><b>{AuthContext.state.account}</b></div>
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

<p onClick={initTableSetup}>Test initTableSetup</p>

        </div>
      </ContentWrapper>
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
