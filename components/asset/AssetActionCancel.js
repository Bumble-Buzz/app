import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';
import API from '@/components/Api';
import useIsMounted from '@/hooks/useIsMounted';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import WalletUtil from '@/components/wallet/WalletUtil';
import CancelIcon from '@/public/market/cancel-outline.svg';
import Toast from '@/components/Toast';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@bumblebuzz/contracts/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


export default function AssetActionCancel({ content }) {
  const isMounted = useIsMounted();
  const { data: session, status: sessionStatus } = useSession();

  let dbTriggered = false;
  const [isLoading, setLoading] = useState(false);
  const [blockchainResults, setBlockchainResults] = useState(null);

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        const payload = {
          'contractAddress': ethers.utils.getAddress(blockchainResults.contractAddress),
          'tokenId': Number(blockchainResults.tokenId),
          'saleId': Number(blockchainResults.itemId),
          'owner': ethers.utils.getAddress(blockchainResults.seller)
        };
        await API.asset.update.saleCancel(payload);

        // pull from db since it has now been updated
        await mutate(API.swr.asset.id(ethers.utils.getAddress(blockchainResults.contractAddress), Number(blockchainResults.tokenId)));

        Toast.success(blockchainResults.message);
        dbTriggered = false;
        if (isMounted.current) setLoading(false);
        if (isMounted.current) setBlockchainResults(null);
      } catch (e) {
        console.error(e);
        Toast.error(e.message);
        if (isMounted.current) setLoading(false);
      }
    })();
  }, [blockchainResults]);

  const action = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      const listener = async (itemId, tokenId, contractAddress, seller) => {
        console.log('found cancel market sale event: ', Number(itemId), Number(tokenId), contractAddress, seller);
        if (!dbTriggered && session.user.id === seller && Number(content.tokenId) === Number(tokenId) &&
        ethers.utils.getAddress(content.contractAddress) === ethers.utils.getAddress(contractAddress)
        ) {
          dbTriggered = true;
          const message = 'Sale has been cancelled';
          setBlockchainResults({ itemId, tokenId, contractAddress, seller, message });
          contract.off("onCancelMarketSale", listener);
        }
      };
      contract.on("onCancelMarketSale", listener);

      // cancel market sale
      const transaction = await contract.cancelMarketSale(content.saleId);
      await transaction.wait();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <ButtonWrapper disabled type="submit" classes="">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />
          {Lexicon.form.submit.processing}
        </ButtonWrapper>
      ) : (
        <ButtonWrapper
          onClick={action}
          classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
        >
          <CancelIcon fill="#ffffff" height={24} width={24} />Cancel Sale
        </ButtonWrapper>
      )}
    </>
  )
}
