import { useRouter } from 'next/router';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import Tooltip from '@/components/Tooltip';
import OfferIcon from '@/public/market/offer-outline.svg';


export default function AssetActionOffer({ link }) {
  const ROUTER = useRouter();

  return (
    <Tooltip text={'Coming soon'}>
      <ButtonWrapper
        onClick={() => ROUTER.push(link)}
        disabled
        classes="bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center"
      >
        <OfferIcon fill="#ffffff" height={24} width={24} />Make Offer
      </ButtonWrapper>
    </Tooltip>
  )
}
