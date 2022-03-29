import Image from 'next/image';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useSession, getSession, getProviders, signIn, signOut } from 'next-auth/react';
import API from '@/components/Api';
import Toast from '@/components/Toast';
import WalletUtil from '@/components/wallet/WalletUtil';
import { useAuth } from '@/contexts/AuthContext';
import ContentWrapper from '@/components/wrappers/ContentWrapper';


const contractsDb = async () => {
  const payload = {
    TableName: "contracts",
    AttributeDefinitions: [
      {
        AttributeName: "contractAddress",
        AttributeType: "S",
      }
    ],
    KeySchema: [
      {
        AttributeName: "contractAddress",
        KeyType: "HASH",
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await API.db.table.create(payload);
  console.log('Created:', results.data);
};

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
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await API.db.table.create(payload);
  console.log('Created:', results.data);
};

const sales = async () => {
  const payload = {
    TableName: "sale",
    AttributeDefinitions: [
      { AttributeName: "contractAddress", AttributeType: "S" },
      { AttributeName: "tokenId", AttributeType: "N" },
      { AttributeName: "seller", AttributeType: "S" },
      { AttributeName: "buyer", AttributeType: "S" },
      { AttributeName: "category", AttributeType: "S" },
      { AttributeName: "active", AttributeType: "N" }
    ],
    KeySchema: [
      { AttributeName: "contractAddress", KeyType: "HASH" },
      { AttributeName: "tokenId", KeyType: "RANGE" }
    ],
    LocalSecondaryIndexes: [
      {
        IndexName: "seller-lsi",
        KeySchema: [
          { AttributeName: "contractAddress", KeyType: "HASH" },
          { AttributeName: "seller", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      },
      {
        IndexName: "buyer-lsi",
        KeySchema: [
          { AttributeName: "contractAddress", KeyType: "HASH" },
          { AttributeName: "buyer", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "seller-gsi",
        KeySchema: [
          { AttributeName: "seller", KeyType: "HASH" },
          { AttributeName: "active", KeyType: "RANGE" }
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
      }
    ],
    BillingMode: "PAY_PER_REQUEST",
  };
  const results = await API.db.table.create(payload);
  console.log('Created:', results.data);
};

const initTableSetup = async () => {
  console.log('start - initTableSetup');

  // await contractsDb();
  await usersDb();
  await collection();
  await asset();
  await sales();

  console.log('end - initTableSetup');
};

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

  const handleSignIn = async () => {
    let userInfo = {
      name: 'Anon',
      wallet: AuthContext.state.account,
      bio: '',
      picture: '',
      timestamp: ''
    };
    const data = await getUsersDb();
    if (data) {
      console.log('user exists, do nothing. or update timestamp?');
      userInfo.name = data.name;
      userInfo.bio = data.bio;
      userInfo.picture = data.picture;
      userInfo.timestamp = data.timestamp;
    }

    const domain = {
      name: 'AvaxTrade',
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
        wallet: AuthContext.state.account
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
        walletId: AuthContext.state.account,
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

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
