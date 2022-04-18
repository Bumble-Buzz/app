import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import ListingPrice from '@/components/profile/general/marketplace/ListingPrice';
import Commission from '@/components/profile/general/marketplace/Commission';
import IncentiveAmount from '@/components/profile/general/marketplace/IncentiveAmount';
import IncentivePercent from '@/components/profile/general/marketplace/IncentivePercent';
import Toast from '@/components/Toast';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


const BATCH_SIZE = 20;

export default function Marketplace({ }) {
  const { data: session, status: sessionStatus } = useSession();
  
  const [balanceSheet, setBalanceSheet] = useState({});
  const [listingPrice, setListingPrice] = useState(0);
  const [commission, setCommission] = useState(0);
  const [incentiveAmount, setIncentiveAmount] = useState(0);
  const [incentivePercent, setIncentivePercent] = useState(0);
  const [isLoading, setLoading] = useState(null);

  useEffect(async () => {
    try {
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // fetch monetary information
      let contractData = 0, valueInt = 0, valueFormatted = 0;

      // listing price
      contractData = Number(await contract.getMarketplaceListingPrice());
      const formattedListingPrice = Number(ethers.utils.formatEther(contractData.toString()));
      setListingPrice(formattedListingPrice);

      // commission
      contractData = Number(await contract.getMarketplaceCommission());
      if (contractData > 0) contractData = contractData/100;
      setCommission(contractData);

      // balance sheet
      contractData = await contract.getBalanceSheet();
      setBalanceSheet(contractData);

      // incentive amount
      valueInt = Number(contractData.incentiveVault);
      valueFormatted = Number(ethers.utils.formatEther(valueInt.toString()));
      setIncentiveAmount(valueFormatted);

      // incentive percent
      contractData = Number(await contract.getMarketplaceIncentiveCommission());
      if (contractData > 0) contractData = contractData/100;
      setIncentivePercent(contractData);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  }, []);


  return (
    <>
      <div className="py-4 px-4 shadow rounded-md border w-full max-w-xl">
        <div className="flex flex-col items-center divide-y w-full">

        <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Listing Price</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(listingPrice, 'decimal', { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <ListingPrice isLoading={isLoading} setLoading={setLoading} account={listingPrice} setAccount={setListingPrice} />
            </div>
          </div>

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Commission</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(commission, 'percent')}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <Commission isLoading={isLoading} setLoading={setLoading} account={commission} setAccount={setCommission} />
            </div>
          </div>

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Incentive Amount</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(incentiveAmount, 'decimal', { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <IncentiveAmount isLoading={isLoading} setLoading={setLoading} account={incentiveAmount} setAccount={setIncentiveAmount} />
            </div>
          </div>

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Incentive Percent</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(incentivePercent, 'percent')}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <IncentivePercent isLoading={isLoading} setLoading={setLoading} account={incentivePercent} setAccount={setIncentivePercent} />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
