import AssetActivityUser from '@/components/asset/AssetActivityUser';
import NumberFormatter from '@/utils/NumberFormatter';
import CreateIcon from '@/public/market/create-outline.svg';
import TransferIcon from '@/public/market/transfer-outline.svg';
import SellIcon from '@/public/market/sell-outline.svg';
import { CHAIN_ICONS } from '@/enum/ChainIcons';
import { ASSET_EVENTS } from '@/enum/AssetEvent';


export default function AssetActivity({ initialData, classes }) {

  if (!initialData || !initialData.activity || initialData.activity.length === 0 ) {
    return (<p>No item activity</p>)
  }

  return (
    <>
      {initialData && initialData.activity && initialData.activity.length > 0 && (
        <div className={`flex flex-col overflow-y-auto max-h-56 w-full ${classes}`}>
          <div className='w-full'>
            <div className='grid grid-cols-6'>
              <div className="bg-blue-100 border px-1 py-1 text-center">Event</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Unit Price</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">USD Unit Price</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Sale Type</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Seller</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Buyer</div>
            </div>
            {initialData.activity.map((listing, index) => {
              return (
                <div key={index} className='grid grid-cols-6 odd:bg-zinc-100'>
                  <div className="border px-1 py-3 text-center flex justify-center items-center gap-x-1">
                    {listing.type === ASSET_EVENTS.mint && (<><CreateIcon height={16} width={16} />{listing.type}</>)}
                    {listing.type === ASSET_EVENTS.transfer && (<><TransferIcon height={16} width={16} />{listing.type}</>)}
                    {listing.type === ASSET_EVENTS.sale && (<><SellIcon height={16} width={16} />{listing.type}</>)}
                  </div>
                  <div className="border px-1 py-3 text-center flex justify-center">
                    <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                    {listing.unitPrice}
                  </div>
                  <div className="border px-1 py-3 text-center">
                    ${NumberFormatter(listing.usdUnitPrice, 'decimal', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="border px-1 py-3 text-center">
                    {listing.saleType === Number(process.env.NEXT_PUBLIC_SALE_TYPE_DIRECT) && <p>Direct</p>}
                    {listing.saleType === Number(process.env.NEXT_PUBLIC_SALE_TYPE_IMMEDIATE) && <p>Immediate</p>}
                    {listing.saleType === Number(process.env.NEXT_PUBLIC_SALE_TYPE_AUCTION) && <p>Auction</p>}
                  </div>
                  <div className="border px-1 py-3 text-center truncate">
                    <AssetActivityUser api={listing.seller} />
                  </div>
                  <div className="border px-1 py-3 text-center truncate">
                    <AssetActivityUser api={listing.buyer} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
