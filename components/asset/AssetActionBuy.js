import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';
import API from '@/components/Api';
import useIsMounted from '@/hooks/useIsMounted';
import Toast from '@/components/Toast';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import WalletUtil from '@/components/wallet/WalletUtil';
import BuyIcon from '@/public/market/buy-outline.svg';
import Date from '@/utils/Date';
import ENUM from '@/enum/ENUM';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';
import CheckEnvironment from '@/components/CheckEnvironment';

import AvaxTradeAbi from '@bumblebuzz/contracts/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


export default function AssetActionBuy({ content, isSignInValid, priceInit }) {
  const ROUTER = useRouter();
  const isMounted = useIsMounted();
  const { data: session, status: sessionStatus } = useSession();

  let dbTriggered = false;
  const [isLoading, setLoading] = useState(false);
  const [blockchainResults, setBlockchainResults] = useState(null);

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        // update asset db table with new information
        const timestamp = Date.getTimestamp();
        const priceHistoryTimestamp = [...content.priceHistory.timestamp, timestamp.toString()];
        const priceHistoryLabel = [...content.priceHistory.label, Date.getShortDate(timestamp)];
        const priceHistoryEth = [...content.priceHistory.ethPrice, (Number(content.price))];
        const priceHistoryUsd = [...content.priceHistory.usdPrice, (Number(priceInit.ethusd) * Number(content.price))];
        const priceHistory = { 'timestamp': priceHistoryTimestamp, 'label': priceHistoryLabel, 'ethPrice': priceHistoryEth, 'usdPrice': priceHistoryUsd };
        const activity = [{
          'saleId': Number(blockchainResults.itemId),
          'saleType' : Number(content.saleType),
          'unitPrice': Number(content.price),
          'usdUnitPrice': (Number(priceInit.ethusd) * Number(content.price)),
          'seller': ethers.utils.getAddress(content.seller),
          'buyer': ethers.utils.getAddress(blockchainResults.buyer),
          'type': ENUM.ASSET_EVENTS.sale
        }];
        activity.push(...content.activity);
        let payload = {
          'contractAddress': ethers.utils.getAddress(blockchainResults.contractAddress),
          'tokenId': Number(blockchainResults.tokenId),
          'saleId': Number(blockchainResults.itemId),
          'owner': ethers.utils.getAddress(blockchainResults.buyer),
          'priceHistory': priceHistory,
          'activity': activity
        };
        await API.asset.update.saleComplete(payload);

        // pull from db since it has now been updated
        await mutate(API.swr.asset.id(ethers.utils.getAddress(blockchainResults.contractAddress), Number(blockchainResults.tokenId)));

        // notify buyer
        const sellerUserData = await API.user.id(ethers.utils.getAddress(content.seller));
        const newNotification = {
          'type': ENUM.ASSET_EVENTS.sale,
          'assetName': content.assetName,
          'contractAddress': ethers.utils.getAddress(blockchainResults.contractAddress),
          'tokenId': Number(blockchainResults.tokenId),
          'unitPrice': Number(content.price),
          'usdUnitPrice': (Number(priceInit.ethusd) * Number(content.price)),
          'saleType' : Number(content.saleType),
          'seller': ethers.utils.getAddress(content.seller),
          'buyer': ethers.utils.getAddress(blockchainResults.buyer),
          'timestamp': timestamp.toString()
        };
        const newNotifications = [...sellerUserData.data.Item.notifications, newNotification];
        payload = {
          'seller': ethers.utils.getAddress(content.seller),
          'buyer': ethers.utils.getAddress(blockchainResults.buyer),
          'notifications': newNotifications
        };
        await API.user.update.notification(payload);

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

    if (!isSignInValid) return ROUTER.push('/auth/signin');

    /** @todo Remove once product released **/
    if (CheckEnvironment.isDevProdMode) { Toast.info(process.env.NEXT_PUBLIC_FEATURE_UNDER_DEVELOPMENT); return; }

    try {
      setLoading(true);
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      const listener = async (itemId, tokenId, contractAddress, buyer, saleProfit) => {
        console.log('found complete market sale event: ', Number(itemId), Number(tokenId), contractAddress, buyer, Number(saleProfit));
        if (!dbTriggered && session.user.id === buyer && Number(content.tokenId) === Number(tokenId) &&
          ethers.utils.getAddress(content.contractAddress) === ethers.utils.getAddress(contractAddress)
          ) {
          dbTriggered = true;
          const message = 'Sale has been completed';
          setBlockchainResults({ itemId, tokenId, contractAddress, buyer, saleProfit, message });
          contract.off("onCompleteMarketSale", listener);
        }
      };
      contract.on("onCompleteMarketSale", listener);

      // complete market sale
      const formattedPrice = ethers.utils.parseUnits(content.price.toString(), 'ether');
      const transaction = await contract.completeMarketSale(content.saleId, { value: formattedPrice });
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
          <BuyIcon fill="#ffffff" height={24} width={24} />Buy Now
        </ButtonWrapper>
      )}
    </>
  )
}
