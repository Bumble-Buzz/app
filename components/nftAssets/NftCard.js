import { useState } from 'react';
import Image from 'next/image';
import IPFS from '../../utils/ipfs';


export default function NftCard({children, innerRef, header, image, body, footer}) {

  return (
    <div className='w-24 sm:w-36 md:w-60 max-w-sm max-h-sm border rounded-lg overflow-hidden shadow-lg' ref={innerRef}>
      {header && (<>
        <div className="pl-2 pr-1 flex flex-nowrap flex-row gap-2 text-left">
          {header}
        </div>
        <hr />
      </>)}
      <div className='relative h-24 sm:h-36 md:h-60'>
        <Image
          src={IPFS.getValidBaseUrl(image)}
          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="contain" sizes='50vw'
        />
      </div>
      {body && (<>
        <hr />
        <div className="px-2 flex flex-col h-20">
          {body}
        </div>
      </>)}
      {footer && (<>
        <hr />
        <div className="px-2 flex flex-nowrap flex-row gap-2 text-left">
          {footer}
        </div>
      </>)}
    </div>
  )
}
