import Image from 'next/image';
import { ethers } from 'ethers';
import { getSession, getProviders, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useWallet } from '@/contexts/WalletContext';
import API from '@/components/Api';
import WalletUtil from '@/components/wallet/WalletUtil';
import Toast from '@/components/Toast';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import CheckEnvironment from '@/components/CheckEnvironment';


const usersDb = async () => {
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
};

const collection = async () => {
  const payload = {
    TableName: "collection",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "active", AttributeType: "N" },
      { AttributeName: "category", AttributeType: "S" },
      { AttributeName: "owner", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "active-gsi",
        KeySchema: [
          { AttributeName: "active", KeyType: "HASH" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "category-gsi",
        KeySchema: [
          { AttributeName: "category", KeyType: "HASH" },
          { AttributeName: "active", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "owner-gsi",
        KeySchema: [
          { AttributeName: "owner", KeyType: "HASH" },
          { AttributeName: "active", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await API.db.table.create(payload);
  console.log('Created:', results.data);
};

const asset = async () => {
  const payload = {
    TableName: "asset",
    AttributeDefinitions: [
      { AttributeName: "contractAddress", AttributeType: "S" },
      { AttributeName: "tokenId", AttributeType: "N" },
      { AttributeName: "creator", AttributeType: "S" },
      { AttributeName: "collectionId", AttributeType: "N" },
      { AttributeName: "onSale", AttributeType: "N" },
      { AttributeName: "owner", AttributeType: "S" }
    ],
    KeySchema: [
      { AttributeName: "contractAddress", KeyType: "HASH" },
      { AttributeName: "tokenId", KeyType: "RANGE" }
    ],
    LocalSecondaryIndexes: [
      {
        IndexName: "creator-lsi",
        KeySchema: [
          { AttributeName: "contractAddress", KeyType: "HASH" },
          { AttributeName: "creator", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "owner-lsi",
        KeySchema: [
          { AttributeName: "contractAddress", KeyType: "HASH" },
          { AttributeName: "owner", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "collectionId-gsi",
        KeySchema: [
          { AttributeName: "collectionId", KeyType: "HASH" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "onSale-gsi",
        KeySchema: [
          { AttributeName: "onSale", KeyType: "HASH" },
          { AttributeName: "owner", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await API.db.table.create(payload);
  console.log('Created:', results.data);
};

const initTableSetup = async () => {
  console.log('start - initTableSetup');

  await usersDb();
  await collection();
  await asset();

  console.log('end - initTableSetup');
};

export default function SignIn() {
  const ROUTER = useRouter();
  const WalletContext = useWallet();

  const walletConnect = async () => {
    await WalletUtil.reqAccountLogin();
  };

  const getUsersDb = async () => {
    const results = await API.user.id(WalletContext.state.account);
    return results.data.Item;
  };

  const putUsersDb = async () => {
    const payload = {id: WalletContext.state.account};
    await API.user.create(payload);
  };

  const handleSignIn = async () => {
    let userInfo = {
      name: 'Anon',
      wallet: WalletContext.state.account,
      bio: '',
      notifications: [],
      picture: '',
      timestamp: ''
    };
    const data = await getUsersDb();
    if (data) {
      userInfo.name = data.name;
      userInfo.bio = data.bio;
      userInfo.notifications = data.notifications;
      userInfo.picture = data.picture;
      userInfo.timestamp = data.timestamp;
    }

    const domain = {
      name: 'BumbleBuzz',
      version: '1',
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      verifyingContract: process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, // contract address
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
        name: userInfo.name,
        wallet: WalletContext.state.account
      },
    };

    try {
      const signer = await WalletUtil.getWalletSigner();
      if (!signer) throw('Authentication failed, issue with wallet')
      const signature = await signer._signTypedData(domain, types, value);
      const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, signature);

      const CredProviders = await getProviders();
      const signedIn = await signIn(CredProviders.myCredentials.id, {
        redirect: false,
        walletId: WalletContext.state.account,
        signature,
        recoveredAddress
      });
      if (signedIn && signedIn.ok) {
        if (!data) {
          await putUsersDb();
        }
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

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col p-2 w-full">

        <div className="p-2 flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-800">Sign<span className="text-indigo-600">In</span></h2>
        </div>

        <div className="p-2 flex flex-col items-center text-center">
          <div className="block p-6 rounded-lg shadow-lg bg-white">

            {!WalletContext.state.isWalletFound && (
              <p className="text-gray-700 text-base mb-4">No Web3 wallet found</p>
            )}
            {!WalletContext.state.isMetamaskFound && (
              <p className="text-gray-700 text-base mb-4">No MetaMask wallet found</p>
            )}
            {WalletContext.state.isWalletFound && WalletContext.state.isMetamaskFound && (
              <Image src={'/metamask.svg'} alt='avocado' width='200' height='200' />
            )}
            {/* {!WalletContext.state.isConnected && (
              <p className="text-gray-700 text-base mb-4">MetaMask is not connected to any chain</p>
            )} */}
            {!WalletContext.state.isNetworkValid && (
              <p className="text-gray-700 text-base mb-4">MetaMask is not connected to Aurora chain</p>
            )}
            {!WalletContext.state.account && (
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

            {WalletContext.state.isWalletFound && WalletContext.state.isMetamaskFound && WalletContext.state.isNetworkValid && WalletContext.state.account && (
              <>
                <div className="text-gray-700 text-base break-all">Sign in using account:</div>
                <div className="text-gray-700 text-base break-all mb-4"><b>{WalletContext.state.account}</b></div>
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

{!CheckEnvironment.isDevAwsMode && (<p onClick={initTableSetup}>Test initTableSetup</p>)}

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
