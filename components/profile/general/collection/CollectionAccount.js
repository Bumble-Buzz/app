import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import API from '@/components/Api';
import WalletUtil from '@/components/wallet/WalletUtil';
import ReflectionClaim from '@/components/profile/general/collection/ReflectionClaim';
import IncentiveAmount from '@/components/profile/general/collection/IncentiveAmount';
import IncentivePercent from '@/components/profile/general/collection/IncentivePercent';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import Toast from '@/components/Toast';
import NumberFormatter from '@/utils/NumberFormatter';
import ENUM from '@/enum/ENUM';

import BankAbi from '@bumblebuzz/contracts/artifacts/contracts/bank/Bank.sol/Bank.json';


const BATCH_SIZE = 20;

export default function CollectionAccount({ collection }) {
  const { data: session, status: sessionStatus } = useSession();
  const {data: ownedAssets} = useSWR(API.swr.asset.owned(session.user.id, collection.contractAddress, 'null', BATCH_SIZE), API.swr.fetcher, API.swr.options);
  
  const [reflection, setReflection] = useState(0);
  const [incentiveAmount, setIncentiveAmount] = useState(0);
  const [incentivePercent, setIncentivePercent] = useState(0);
  const [isLoading, setLoading] = useState(null);
  const [ownedTokenIds, setOwnedTokenIds] = useState([]);

  useEffect(async () => {
    if (collection) {
      try {
        const signer = await WalletUtil.getWalletSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);
  
        // fetch monetary information
        const collectionAccount = await contract.getCollectionAccount(collection.contractAddress);

        // incentive amount
        const incentiveInt = Number(collectionAccount.incentiveVault);
        const incentiveBalance = Number(ethers.utils.formatEther(incentiveInt.toString()));
        setIncentiveAmount(incentiveBalance);

        // incentive percent
        const incentivePercent = collection.incentive > 0 ? collection.incentive/100 : collection.incentive;
        setIncentivePercent(incentivePercent);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
      }
    };
  }, [collection]);

  useEffect(async () => {
    if (
      Number(collection.id) !== Number(process.env.NEXT_PUBLIC_UNVERIFIED_COLLECTION_ID) &&
      Number(collection.id) !== Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID) &&
      ownedAssets && ownedAssets.Items.length > 0)
    {
      try {
        const signer = await WalletUtil.getWalletSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);
  
        const collectionReflection = await contract.getReflectionVaultCollectionAccount(collection.contractAddress);
        if (collectionReflection.length === 0) return;

        let totalReflection = 0;
        let myTokenIds = []
        ownedAssets.Items.forEach((asset) => {
          const reflectionId = asset.tokenId-1;
          const reflectionInt = Number(collectionReflection[reflectionId]);
          const reflectionClaim = Number(ethers.utils.formatEther(reflectionInt.toString()));
          totalReflection += reflectionClaim;
          myTokenIds.push(asset.tokenId);
        });
        setOwnedTokenIds([...myTokenIds]);
        setReflection(totalReflection);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
      }
    };
  }, [ownedAssets]);


  return (
    <>
      <div className="py-4 px-4 shadow rounded-md border w-full max-w-xl">
        <div className="flex flex-col items-center divide-y w-full">

          <div className='py-1 flex flex-row flex-wrap justify-center items-center gap-x-2 w-full'>
            <div className='flex-1'>
              {collection.name && (<LinkWrapper link={`/collection/${collection.id}`} linkText={collection.name} />)}
            </div>
          </div>

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Reflection</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{ENUM.CURRENCY_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(reflection, 'decimal', { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <div className='flex-1'>
              <ReflectionClaim
                isLoading={isLoading} setLoading={setLoading}
                account={reflection} setAccount={setReflection}
                contractAddress={collection.contractAddress} ownedTokenIds={ownedTokenIds}
              />
            </div>
          </div>

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Incentive Amount</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{ENUM.CURRENCY_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(incentiveAmount, 'decimal', { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <IncentiveAmount
                isLoading={isLoading} setLoading={setLoading}
                account={incentiveAmount} setAccount={setIncentiveAmount}
                contractAddress={collection.contractAddress} ownerIncentiveAccess={collection.ownerIncentiveAccess}
              />
            </div>
          </div>

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Incentive Percent</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{ENUM.CURRENCY_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(incentivePercent, 'percent')}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <IncentivePercent
                isLoading={isLoading} setLoading={setLoading}
                account={incentivePercent} setAccount={setIncentivePercent}
                collection={collection}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
