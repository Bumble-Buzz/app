import Image from 'next/image';
import { useRouter } from 'next/router';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import OfferIcon from '@/public/market/offer-outline.svg';
import BuyIcon from '@/public/market/buy-outline.svg';
import SellIcon from '@/public/market/sell-outline.svg';
import BidIcon from '@/public/market/bid-outline.svg';

export default function AssetAction({children, links, isAssetOwner = false, isAssetOnSale = false}) {
  const ROUTER = useRouter();

  const chainSymbols = {
    ethereum: (<Image src={'/chains/ethereum-color.svg'} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />)
  };

  const text = () => {
    if (isAssetOnSale) return (<div>Current price</div>);
    return (<div>Highest offer</div>);
  };

  const buttons = () => {
    if (isAssetOwner && isAssetOnSale) {
      return (
        <ButtonWrapper
          onClick={() => ROUTER.push(links.cancelSale)}
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
        <div className='text-2xl font-bold'>0</div>
      </div>
      <div className='flex flex-row flex-wrap gap-1'>
        {buttons()}
      </div>
    </div>
  )
}
