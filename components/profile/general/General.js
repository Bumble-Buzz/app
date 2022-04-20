import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';
import WalletUtil from '@/components/wallet/WalletUtil';
import UserAccount from '@/components/profile/general/user/UserAccount';
import CollectionAccounts from '@/components/profile/general/collection/CollectionAccounts';
import Marketplace from '@/components/profile/general/marketplace/Marketplace';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import Toast from '@/components/Toast';

import BankAbi from '@/artifacts/contracts/bank/Bank.sol/Bank.json';
import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


export default function General({ initialData }) {
  const ROUTER = useRouter();
  const WalletContext = useWallet();
  const { data: session, status: sessionStatus } = useSession();

  const [tab, setTab] = useState('user');

  const [collection, setCollection] = useState(null);
  const [user, setUser] = useState(null);
  const [vault, setVault] = useState(null);

  useEffect(() => {
    if (WalletContext.state.account) initialBlockchainFetch();
  }, [WalletContext.state.account]);

  const initialBlockchainFetch = async () => {
    try {
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);

      // fetch monetary information
      const val = await contract.getBank(WalletContext.state.account);
      setCollection(val.collection);
      setUser(val.user);
      setVault(val.vault);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  };

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === WalletContext.state.account &&
      WalletContext.state.isNetworkValid
    )
  };
  const isProfileOwner = () => {
    return (session.user.id === ROUTER.query.wallet)
  };
  const isProfileOwnerSignedIn = () => {
    return (isSignInValid() && isProfileOwner())
  };
  const isUserAdmin = () => {
    return (isProfileOwnerSignedIn() && WalletContext.state.account === process.env.NEXT_PUBLIC_ADMIN_WALLET_ID)
  };


  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className='py-2 flex flex-col w-full gap-2 items-center'>
        <div className="">
          General dashboard info. Place where users can redeem funds/rewards.
        </div>

        {isProfileOwnerSignedIn() && (<>
          {/* user / collection */}
          <div className="px-4 gap-2 flex flex-row flex-wrap justify-center items-center text-center">
            {tab === 'user' ?
              (<button className="flex flex-nowrap text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('user')}>User Account</button>)
              :
              (<button className="flex flex-nowrap text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('user')}>User Account</button>)
            }
            {tab === 'collection' ?
              (<button className="flex flex-nowrap text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('collection')}>Collection Account</button>)
              :
              (<button className="flex flex-nowrap text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('collection')}>Collection Account</button>)
            }
            {isUserAdmin() && (
              tab === 'marketplace' ?
                (<button className="flex flex-nowrap text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('marketplace')}>Marketplace</button>)
                :
                (<button className="flex flex-nowrap text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('marketplace')}>Marketplace</button>)
            )}
          </div>

          {tab === 'user' && <UserAccount initialData={user} />}
          {tab === 'collection' && <CollectionAccounts collectionData={initialData} />}
          {tab === 'marketplace' && <Marketplace />}
        </>)}

      </div>
    </ContentWrapper>
  )
}
