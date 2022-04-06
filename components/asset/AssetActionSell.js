import { useRouter } from 'next/router';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import SellIcon from '@/public/market/sell-outline.svg';


export default function AssetActionSell({ link }) {
  const ROUTER = useRouter();

  return (
    <ButtonWrapper
      onClick={() => ROUTER.push(link)}
      classes="bg-indigo-600 hover:bg-indigo-700 gap-x-1 items-center"
    >
      <SellIcon fill="#ffffff" height={24} width={24} />Sell Now
    </ButtonWrapper>
  )
}
