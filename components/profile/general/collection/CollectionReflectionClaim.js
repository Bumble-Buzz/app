import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import Toast from '@/components/Toast';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


const ACCOUNT_IDENTIFIER = 'collection_reflection';

export default function CollectionReflectionClaim({ isLoading, setLoading, setAccount }) {
  const { data: session, status: sessionStatus } = useSession();

  const claimTimeout = () => {
    console.log('start timeout');
    setTimeout(() => {
      setAccount(0);
      setLoading(null);
      console.log('end timeout');
    }, 5000);
  };

  const claim = async (e) => {
    e.preventDefault();


    try {
      setLoading(ACCOUNT_IDENTIFIER);

      console.log('isLoading', isLoading);
      console.log('ACCOUNT_IDENTIFIER:', ACCOUNT_IDENTIFIER);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // claim rewards
      const val = await contract.claimReflectionRewardCollectionAccount(1, "0xBDDf875B6f5Aa1C64aEA75c3bDf19b2b46215E29");
        
      await WalletUtil.checkTransaction(val);

      const listener = async (user, reward, rewardType) => {
        const rewardInt = Number(reward);
        const rewardClaim = Number(ethers.utils.formatEther(rewardInt.toString()));
        console.log('found claim rewards event: ', user, rewardInt, rewardType);
        if (session.user.id === user && ACCOUNT_IDENTIFIER === rewardType) {
          Toast.success(`Reward claim: ${rewardClaim} ETH`);
          setAccount(0);
          setLoading(null);
          contract.off("onClaimRewards", listener);
        }
      };
      contract.on("onClaimRewards", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };

  return (
    <>
      {isLoading && isLoading === ACCOUNT_IDENTIFIER && (
        <ButtonWrapper disabled type="submit">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />Processing
        </ButtonWrapper>
      )}
      {isLoading && isLoading !== ACCOUNT_IDENTIFIER && (
        <ButtonWrapper disabled classes='bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center'>Claim</ButtonWrapper>
      )}
      {!isLoading && (
        <ButtonWrapper classes='px-1 py-1' onClick={claim}>Claim</ButtonWrapper>
      )}
    </>
  )
}
