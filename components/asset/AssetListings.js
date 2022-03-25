import { useRouter } from 'next/router';
import AssetListingsUser from '@/components/asset/AssetListingsUser';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


export default function AssetListings({ initialData, classes }) {
  console.log('initialData', initialData);
  const ROUTER = useRouter();

  return (
    <>
      {initialData && initialData.listings && initialData.listings.length > 0 && (
        <div className={`flex flex-col overflow-y-auto max-h-56 w-full ${classes}`}>
          <div className='w-full'>
            <div className='grid grid-cols-5'>
              <div className="bg-blue-100 border px-1 py-1 text-center">Unit Price</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">USD Unit Price</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Sale Type</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Seller</div>
              <div className="bg-blue-100 border px-1 py-1 text-center">Buyer</div>
            </div>
            {initialData.listings.map((listing, index) => {
              return (
                <div key={index} className='grid grid-cols-5 odd:bg-zinc-100'>
                  <div className="border px-1 py-3 text-center flex justify-center">
                    <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                    {listing.unitPrice}
                  </div>
                  <div className="border px-1 py-3 text-center">
                    ${NumberFormatter(listing.usdUnitPrice, 'decimal', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="border px-1 py-3 text-center">Immediate</div>
                  <div className="border px-1 py-3 text-center truncate">
                    <AssetListingsUser api={listing.seller} />
                  </div>
                  <div className="border px-1 py-3 text-center truncate">
                    <AssetListingsUser api={listing.buyer} />
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