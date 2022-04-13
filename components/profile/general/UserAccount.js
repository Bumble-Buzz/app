import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


export default function UserAccount({ initialData }) {
  // console.log('initialData', initialData);

  const [general, setGeneral] = useState(0);
  const [nftCommission, setNftCommission] = useState(0);
  const [collectionCommission, setCollectionCommission] = useState(0);

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
      <div className={`flex flex-col overflow-x-auto overflow-y-auto border`}>
        <div className='max-w-2xl'>

          <div className='grid grid-cols-3'>
            <div className="bg-blue-100 border px-1 py-1 text-center font-bold col-span-3">User Account</div>
          </div>

          <div className='grid grid-cols-3'>
            <div className="bg-blue-100 border px-1 py-1 text-center flex justify-center items-center">General</div>
            <div className="bg-blue-100 border px-1 py-1 text-center flex justify-center items-center">NFT Commission</div>
            <div className="bg-blue-100 border px-1 py-1 text-center flex justify-center items-center">Collection Commission</div>
          </div>

          <div className='grid grid-cols-3 bg-zinc-100'>
            <div className="bg-blue-100 border px-1 py-1 text-center flex flex-wrap gap-2 justify-center sm:justify-between items-center">
              <div className='flex flex-row flex-nowrap items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(general, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
            <div className="bg-blue-100 border px-1 py-1 text-center flex flex-wrap gap-2 justify-center sm:justify-between items-center">
              <div className='flex flex-row flex-nowrap items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(nftCommission, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
            <div className="bg-blue-100 border px-1 py-1 text-center flex flex-wrap gap-2 justify-center sm:justify-between items-center">
              <div className='flex flex-row flex-nowrap items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(collectionCommission, 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
          </div>

          {/* <div className='grid grid-cols-3'>
            <div className="bg-blue-100 border px-1 py-1 text-center">
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
            <div className="bg-blue-100 border px-1 py-1 text-center">
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
            <div className="bg-blue-100 border px-1 py-1 text-center">
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
          </div> */}

          <div className='grid grid-cols-3'>
            <div className="bg-blue-100 border px-1 py-1 text-center col-span-3">
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim All</ButtonWrapper>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
