import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import API from '@/components/Api';
import NftCard from '../nftAssets/NftCard';
import Link from 'next/link';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/solid';


export default function AssetsRelated({ initialData, classes }) {
  const ROUTER = useRouter();
  // swr call to fetch initial data
  const {data: assets} = useSWR(API.swr.asset.collection(initialData.contractAddress, 'null', 10), API.swr.fetcher, API.swr.options);
  const [filteredAssets, setFilteredAssets] = useState([]);

  useEffect(() => {
    if (assets && assets.Items && assets.Items.length > 0) {
      const filteredAssets = assets.Items.filter((asset) => asset.tokenId !== initialData.tokenId);
      setFilteredAssets(filteredAssets);
    }
  }, [assets]);

  if (
    !initialData ||
    !assets || !assets.Items || assets.Items.length === 0 ||
    !filteredAssets || filteredAssets.length === 0
  ){
    return (<p>No related assets in this collection</p>)
  }


  return (
    <>
      <div className={`flex flex-row overflow-x-auto w-full ${classes}`}>
        <div className='w-max'>
          <div className='px-2 py-2 flex flex-row w-full gap-4'>

            {filteredAssets.map((asset, index) => {
              return (
                <div
                  key={index}
                  className='w-full grow w-40 sm:w-56 border rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 cursor-pointer'
                  onClick={() => ROUTER.push(`/asset/${asset.contractAddress}/${asset.tokenId}`)}
                >
                  <NftCard
                    header={(<>
                      <div className="flex-1 font-bold text-purple-500 text-xl truncate">{asset.config.name}</div>
                      <div className='flex items-center'>
                        {asset.collectionId === 1 && <ShieldExclamationIcon className="w-5 h-5" fill="#ff3838" alt="unverified" title="unverified" aria-hidden="true" />}
                        {asset.collectionId !== 1 && <ShieldCheckIcon className="w-5 h-5" fill="#33cc00" alt="verified" title="verified" aria-hidden="true" />}
                      </div>
                    </>)}
                    image={asset.config.image}
                    body={(<>
                      <div className="flex flex-nowrap flex-row gap-2 text-left">
                        {/* <div className="flex-1 truncate">COLLECTION NAME HERE</div> */}
                        <div className="truncate"></div>
                      </div>
                      <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                        <div className="flex-1">ID</div>
                        <div className="truncate">{asset.tokenId}</div>
                      </div>
                      <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                        <div className="flex-1">Owner</div>
                        <div className="truncate">
                          {asset.ownerName && (<Link href={`/profile/${asset.owner}`} passHref={true}><a className='text-blue-500'>{asset.ownerName}</a></Link>)}
                          {!asset.ownerName && (<Link href={`/profile/${asset.owner}`} passHref={true}><a className='text-blue-500'>{asset.owner}</a></Link>)}
                        </div>
                      </div>
                    </>)}
                    footer={(<>
                      <div className="flex-1 truncate">{asset.config.name}</div>
                      <div className="truncate">{asset.config.name}</div>
                    </>)}
                  />
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </>
  )
}
