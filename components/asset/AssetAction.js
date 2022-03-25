import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession, getSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import API from '@/components/Api';
import WalletUtil from '@/components/wallet/WalletUtil';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import Toast from '@/components/Toast';
import OfferIcon from '@/public/market/offer-outline.svg';
import BuyIcon from '@/public/market/buy-outline.svg';
import SellIcon from '@/public/market/sell-outline.svg';
import BidIcon from '@/public/market/bid-outline.svg';
import CancelIcon from '@/public/market/cancel-outline.svg';
import Tooltip from '@/components/Tooltip';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


export default function AssetAction({children, links, content, isSignInValid, isAssetOwner, isAssetOnSale}) {
  const ROUTER = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const {data: priceInit} = useSWR(API.swr.price.aurora.ethereum(), API.swr.fetcher, API.swr.options);

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
          'saleId': Number(blockchainResults.itemId)
        };
        await API.sale.remove(payload);

        // pull from db since it has now been updated
        await mutate(API.swr.sale.id(ethers.utils.getAddress(blockchainResults.contractAddress), Number(blockchainResults.tokenId)));

        Toast.success(blockchainResults.message);
        dbTriggered = false;
        setLoading(false);
        setBlockchainResults(null);
      } catch (e) {
        console.error(e);
        Toast.error(e.message);
        setLoading(false);
      }
    })();
  }, [blockchainResults]);

  const cancelSale = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // cancel market sale
      const val = await contract.cancelMarketSale(content.saleId);

      await WalletUtil.checkTransaction(val);

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
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const buyNow = async (e) => {
    e.preventDefault();

    if (!isSignInValid) return ROUTER.push('/auth/signin');

    try {
      setLoading(true);
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // complete market sale
      const formattedPrice = ethers.utils.parseUnits(content.price.toString(), 'ether');

      const val = await contract.completeMarketSale(content.saleId, { value: formattedPrice });

      await WalletUtil.checkTransaction(val);

      const listener = async (itemId, tokenId, contractAddress, buyer, saleProfit) => {
        console.log('found complete market sale event: ', Number(itemId), Number(tokenId), contractAddress, buyer, Number(saleProfit));
        if (!dbTriggered && session.user.id === buyer && Number(content.tokenId) === Number(tokenId) &&
          ethers.utils.getAddress(content.contractAddress) === ethers.utils.getAddress(contractAddress)
        ) {
          // update asset db table with new information
          const listings = [...content.listings];
          listings.push({
            'unitPrice': Number(content.price),
            'usdUnitPrice': Number(priceInit.ethusd),
            'seller': ethers.utils.getAddress(content.seller),
            'buyer': ethers.utils.getAddress(buyer)
          });
          const payload = {
            'contractAddress': ethers.utils.getAddress(contractAddress),
            'tokenId': Number(tokenId),
            'saleId': Number(itemId),
            'buyer': ethers.utils.getAddress(buyer),
            'listings': listings
          };
          await API.asset.update.postsale(payload);

          // pull from db since it has now been updated
          await mutate(API.swr.asset.id(ethers.utils.getAddress(contractAddress), Number(tokenId)));

          dbTriggered = true;
          const message = 'Sale has been completed';
          setBlockchainResults({ itemId, tokenId, contractAddress, seller: buyer, saleProfit, message });
          contract.off("onCompleteMarketSale", listener);
        }
      };
      contract.on("onCompleteMarketSale", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }

  };

  const text = () => {
    if (isAssetOnSale) return (<div>Current price</div>);
    return (<div>Highest offer</div>);
  };

  const price = () => {
    const priceEthUsd = (priceInit && priceInit.ethusd) ? priceInit.ethusd : 0;
    const priceETH = (content.price) ? content.price : 0;
    const priceUSD = Number(priceEthUsd) * Number(priceETH);
    const formattedPriceUSD = NumberFormatter(priceUSD, 'decimal', { maximumFractionDigits: 2 });
    return (
      <>
        <div className='text-2xl font-bold'>{priceETH}</div>
        <div className=''>(${formattedPriceUSD} USD)</div>
      </>
    );
  };

  const buttons = () => {
    if (isLoading) {
      return (
        <ButtonWrapper disabled type="submit" classes="">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />
          {Lexicon.form.submit.processing}
        </ButtonWrapper>
      )
    }

    if (isAssetOwner && isAssetOnSale) {
      return (
        <ButtonWrapper
          onClick={cancelSale}
          classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
        >
          <CancelIcon fill="#ffffff" height={24} width={24} />Cancel Sale
        </ButtonWrapper>
      );
    }

    if (isAssetOwner && !isAssetOnSale) {
      return (
        <ButtonWrapper
          onClick={() => ROUTER.push(links.sellNow)}
          classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
        >
          <SellIcon fill="#ffffff" height={24} width={24} />Sell Now
        </ButtonWrapper>
      );
    }

    if (!isAssetOwner && isAssetOnSale) {
      return (
        <>
          <ButtonWrapper
            onClick={buyNow}
            classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
          >
            <BuyIcon fill="#ffffff" height={24} width={24} />Buy Now
          </ButtonWrapper>
          {/* <ButtonWrapper
            onClick={() => ROUTER.push(links.placeBid)}
            classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
          >
            <BidIcon fill="#ffffff" height={24} width={24} />Place Bid
          </ButtonWrapper> */}
        </>
      );
    }

    // default - !isAssetOwner && !isAssetOnSale
    return (
      <Tooltip text={'Coming soon'}>
      <ButtonWrapper
        onClick={() => ROUTER.push(links.makeOffer)}
        disabled
        classes="bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center"
      >
        <OfferIcon fill="#ffffff" height={24} width={24} />Make Offer
      </ButtonWrapper>
      </Tooltip>
    );
  };

  return (
    <div className='p-4 flex flex-col w-full gap-2 border rounded-lg overflow-hidden bg-zinc-50'>
      {text()}
      <div className='flex flex-row gap-x-1 items-center'>
        <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
        {price()}
      </div>
      <div className='flex flex-row flex-wrap gap-1'>
        {buttons()}
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    }
  }
}
