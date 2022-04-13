import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import UserAccount from '@/components/profile/general/UserAccount';
import CollectionAccount from '@/components/profile/general/CollectionAccount';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import Toast from '@/components/Toast';

import BankAbi from '@/artifacts/contracts/bank/Bank.sol/Bank.json';
import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


export default function General() {
  const { data: session, status: sessionStatus } = useSession();

  const [collection, setCollection] = useState(null);
  const [user, setUser] = useState(null);
  const [vault, setVault] = useState(null);

  useEffect(() => {
    initialBlockchainFetch();
  }, []);

  const initialBlockchainFetch = async () => {
    try {
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);

      // fetch monetary information
      const val = await contract.getBank(session.user.id);
      setCollection(val.collection);
      setUser(val.user);
      setVault(val.vault);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  };

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className='py-2 flex flex-col w-full gap-2 items-center'>
        <div className="">
          General dashboard info. Place where users can redeem funds/rewards.
        </div>

        <UserAccount initialData={user} />

        <div className='flex flex-row flex-wrap w-full gap-2 justify-center items-center'>
          <CollectionAccount />
          <CollectionAccount />
          <CollectionAccount />
          <CollectionAccount />
          <CollectionAccount />
          <CollectionAccount />
        </div>
      </div>
    </ContentWrapper>
  )
}
