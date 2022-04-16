import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import CollectionIncentive from '@/components/profile/general/collection/CollectionIncentive';
import CollectionReflectionClaim from '@/components/profile/general/collection/CollectionReflectionClaim';
import Toast from '@/components/Toast';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';

import BankAbi from '@/artifacts/contracts/bank/Bank.sol/Bank.json';


export default function CollectionAccount({ collection }) {
  const { data: session, status: sessionStatus } = useSession();

  const [reflection, setReflection] = useState(0);
  const [incentive, setIncentive] = useState(0);
  const [isLoading, setLoading] = useState(null);

  useEffect(() => {
    if (session.user.id) initialBlockchainFetch();
  }, [session.user.id]);

  const initialBlockchainFetch = async () => {
    try {
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);

      // fetch monetary information
      const val = await contract.getCollectionAccount(session.user.id);

      const reflectionInt = Number(val.supply); // FIXME: fetch reacl reflectionVault
      const reflectionBalance = Number(ethers.utils.formatEther(reflectionInt.toString()));
      setReflection(reflectionBalance);

      const incentiveInt = Number(val.incentiveVault);
      const incentiveBalance = Number(ethers.utils.formatEther(incentiveInt.toString()));
      setIncentive(incentiveBalance);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  };


  return (
    <>
      <div className="py-4 px-4 shadow rounded-md border w-full max-w-xl">
        <div className="flex flex-col items-center divide-y w-full">

          <div className='py-1 flex flex-row flex-wrap justify-center items-center gap-x-2 w-full'>
            <div className='flex-1'>{collection.name}</div>
          </div>
          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Reflection</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(reflection, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className='flex-1'>
              <CollectionReflectionClaim isLoading={isLoading} setLoading={setLoading} account={reflection} setAccount={setReflection} />
            </div>
          </div>
          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Incentive</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(incentive, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <CollectionIncentive
                isLoading={isLoading} setLoading={setLoading}
                account={incentive} setAccount={setIncentive}
                // ownerIncentiveAccess={collection.ownerIncentiveAccess}
                ownerIncentiveAccess={true} // FIXME remove hard-coded true after testing is done
              />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
