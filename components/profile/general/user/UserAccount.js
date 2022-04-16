import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import GeneralClaim from '@/components/profile/general/user/GeneralClaim';
import NftCommissionClaim from '@/components/profile/general/user/NftCommissionClaim';
import CollectionCommissionClaim from '@/components/profile/general/user/CollectionCommissionClaim';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


export default function UserAccount({ initialData }) {

  const [general, setGeneral] = useState(0);
  const [nftCommission, setNftCommission] = useState(0);
  const [collectionCommission, setCollectionCommission] = useState(0);
  const [isLoading, setLoading] = useState(null);

  useEffect(() => {
    if (initialData) {
      const generalInt = Number(initialData.general);
      const generalBalance = Number(ethers.utils.formatEther(generalInt.toString()));
      setGeneral(generalBalance);
      const nftCommissionInt = Number(initialData.nftCommission);
      const nftCommissionBalance = Number(ethers.utils.formatEther(nftCommissionInt.toString()));
      setNftCommission(nftCommissionBalance);
      const collectionCommissionInt = Number(initialData.collectionCommission);
      const collectionCommissionBalance = Number(ethers.utils.formatEther(collectionCommissionInt.toString()));
      setCollectionCommission(collectionCommissionBalance);
    }
  }, [initialData]);


  return (
    <>
      <div className="py-4 px-4 shadow rounded-md border w-full max-w-xl">
        <div className="flex flex-col items-center divide-y w-full">

          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>General Account</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(general, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className='flex-1'>
              <GeneralClaim isLoading={isLoading} setLoading={setLoading} setAccount={setGeneral} />
            </div>
          </div>
          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>NFT Commission</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(nftCommission, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className='flex-1'>
              <NftCommissionClaim isLoading={isLoading} setLoading={setLoading} setAccount={setNftCommission} />
            </div>
          </div>
          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Collection Commission</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(collectionCommission, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className='flex-1'>
              <CollectionCommissionClaim isLoading={isLoading} setLoading={setLoading} setAccount={setCollectionCommission} />
            </div>
          </div>
          {/* <div className='py-1 flex flex-row flex-wrap justify-center items-center gap-x-2 w-full'>
            <div className='flex-1'>
              <GeneralClaim isLoading={isLoading} setLoading={setLoading} />
            </div>
          </div> */}

        </div>
      </div>
    </>
  )
}
