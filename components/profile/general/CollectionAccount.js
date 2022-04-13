import { useEffect, useState } from 'react';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


export default function CollectionAccount() {

  return (
    <>
      <div className={`flex flex-col overflow-x-auto overflow-y-auto border`}>
        <div className='max-w-2xl'>

          <div className='grid grid-cols-3'>
            <div className="bg-blue-100 border px-1 py-1 text-center font-bold col-span-3">Collection Account: collection-name</div>
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
                <div className='truncate'>{NumberFormatter(Number(1212345165), 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
            <div className="bg-blue-100 border px-1 py-1 text-center flex flex-wrap gap-2 justify-center sm:justify-between items-center">
              <div className='flex flex-row flex-nowrap items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(Number(1212345165), 'decimal', { maximumFractionDigits: 2 })}</div>
              </div>
              <ButtonWrapper classes='px-1 py-1' onClick={() => {}}>Claim</ButtonWrapper>
            </div>
            <div className="bg-blue-100 border px-1 py-1 text-center flex flex-wrap gap-2 justify-center sm:justify-between items-center">
              <div className='flex flex-row flex-nowrap items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(Number(1212345165), 'decimal', { maximumFractionDigits: 2 })}</div>
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
