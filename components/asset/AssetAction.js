import useSWR from 'swr';
import API from '@/components/Api';
import AssetActionOffer from '@/components/asset/AssetActionOffer';
import AssetActionSell from '@/components/asset/AssetActionSell';
import AssetActionCancel from '@/components/asset/AssetActionCancel';
import AssetActionBuy from '@/components/asset/AssetActionBuy';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


export default function AssetAction({children, links, content, isSignInValid, isAssetOwner, isAssetOnSale}) {
  const {data: priceInit} = useSWR(API.swr.price.aurora.ethereum(), API.swr.fetcher, API.swr.options);

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
    if (isAssetOwner && isAssetOnSale) {
      return (<AssetActionCancel content={content} />);
    }

    if (isAssetOwner && !isAssetOnSale) {
      return (<AssetActionSell link={links.sellNow} />);
    }

    if (!isAssetOwner && isAssetOnSale) {
      return (<AssetActionBuy content={content} isSignInValid={isSignInValid} priceInit={priceInit} />);
    }

    // default - !isAssetOwner && !isAssetOnSale
    return (<AssetActionOffer link={links.makeOffer} />);
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
