import useSWR from 'swr';
import API from '@/components/Api';
import LinkWrapper from '@/components/wrappers/LinkWrapper';


export default function AssetListings({ api }) {
  const { data } = useSWR(API.swr.user.id(api), API.swr.fetcher, API.swr.options);
  return (
    <>
      {data && data.Item.name && (<LinkWrapper link={`/profile/${data.Item.walletId}`} linkText={data.Item.name} />)}
      {data && !data.Item.name && (<LinkWrapper link={`/profile/${data.Item.walletId}`} linkText={data.Item.walletId} />)}
    </>
  )
}
