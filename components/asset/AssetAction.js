import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession, getSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { mutate } from 'swr';
import API from '@/components/Api';
import WalletUtil from '@/components/wallet/WalletUtil';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import Toast from '@/components/Toast';
import OfferIcon from '@/public/market/offer-outline.svg';
import BuyIcon from '@/public/market/buy-outline.svg';
import SellIcon from '@/public/market/sell-outline.svg';
import BidIcon from '@/public/market/bid-outline.svg';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


export default function AssetAction({children, links, content, isAssetOwner = false, isAssetOnSale = false}) {
  const ROUTER = useRouter();
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
          'saleId': Number(blockchainResults.itemId)
        };
        await API.sale.remove(payload);

        // pull from db since it has now been updated
        await mutate(API.swr.sale.id(blockchainResults.contractAddress, blockchainResults.tokenId));

        setLoading(false);
        setBlockchainResults(null);
      } catch (e) {
        console.error(e);
        Toast.error(e.message);
        setLoading(false);
      }
    })();
  }, [blockchainResults]);

  const chainSymbols = {
    ethereum: (<Image src={'/chains/ethereum-color.svg'} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />)
  };

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
          setBlockchainResults({ itemId, tokenId, contractAddress, seller });
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

  const text = () => {
    if (isAssetOnSale) return (<div>Current price</div>);
    return (<div>Highest offer</div>);
  };

  const price = () => {
    if (isAssetOnSale) return (<div className='text-2xl font-bold'>{content.price}</div>);
    return (<div className='text-2xl font-bold'>0</div>);
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
          <SellIcon fill="#ffffff" height={24} width={24} />Cancel Sale
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
            onClick={() => ROUTER.push(links.buyNow)}
            classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
          >
            <BuyIcon fill="#ffffff" height={24} width={24} />Buy Now
          </ButtonWrapper>
          <ButtonWrapper
            onClick={() => ROUTER.push(links.placeBid)}
            classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
          >
            <BidIcon fill="#ffffff" height={24} width={24} />Place Bid
          </ButtonWrapper>
        </>
      );
    }

    // default - !isAssetOwner && !isAssetOnSale
    return (
      <ButtonWrapper
        onClick={() => ROUTER.push(links.makeOffer)}
        classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
      >
        <OfferIcon fill="#ffffff" height={24} width={24} />Make Offer
      </ButtonWrapper>
    );
  };

  return (
    <div className='p-4 flex flex-col w-full gap-2 border rounded-lg overflow-hidden bg-zinc-50'>
      {text()}
      <div className='flex flex-row gap-x-1 items-center'>
        <div className="relative h-5 w-5">{chainSymbols.ethereum}</div>
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
