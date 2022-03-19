import Image from 'next/image';
import { useRouter } from 'next/router';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import OfferIcon from '@/public/market/offer-outline.svg';
import BuyIcon from '@/public/market/buy-outline.svg';
import SellIcon from '@/public/market/sell-outline.svg';
import BidIcon from '@/public/market/bid-outline.svg';

export default function AssetAction({children, isAssetOwner = false}) {
  const ROUTER = useRouter();

  const chainSymbols = {
    ethereum: (<Image src={'/chains/ethereum-color.svg'} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />)
  };

  return (
    <div className='p-4 flex flex-col w-full gap-2 border rounded-lg overflow-hidden bg-zinc-50'>
      <div className=''>Highest offer</div>
      <div className='flex flex-row gap-x-1 items-center'>
        <div className="relative h-5 w-5">{chainSymbols.ethereum}</div>
        <div className='text-2xl font-bold'>0</div>
      </div>
      <div className='flex flex-row flex-wrap gap-1'>
        {isAssetOwner ? (
          <ButtonWrapper
            onClick={() => ROUTER.push(`/`)}
            classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
          >
            <SellIcon fill="#ffffff" height={24} width={24} />Sell Now
          </ButtonWrapper>
        ) : (
          <>
            <ButtonWrapper
              // onClick={() => dispatch({ type: filterItem, payload: { item: item.name } })}
              classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
            >
              <OfferIcon fill="#ffffff" height={24} width={24} />Make Offer
            </ButtonWrapper>
            <ButtonWrapper
              // onClick={() => dispatch({ type: filterItem, payload: { item: item.name } })}
              classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
            >
              <BuyIcon fill="#ffffff" height={24} width={24} />Buy Now
            </ButtonWrapper>
            <ButtonWrapper
              // onClick={() => dispatch({ type: filterItem, payload: { item: item.name } })}
              classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
            >
              <BidIcon fill="#ffffff" height={24} width={24} />Place Bid
            </ButtonWrapper>
          </>
        )}
      </div>
    </div>
  )
}
