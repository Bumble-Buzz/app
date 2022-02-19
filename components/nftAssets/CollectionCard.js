import Image from 'next/image';
import IPFS from '../../utils/ipfs';


export default function NftCard({children, innerRef, header, image, body, footer}) {

  return (
    <div className='w-full grow md:w-80 lg:w-96 max-w-md border rounded-lg overflow-hidden shadow-lg' ref={innerRef}>
      {header && (<>
        <div className="pl-2 pr-1 flex flex-nowrap flex-row gap-2 text-left">
          {header}
        </div>
        <hr />
      </>)}
      <div className='relative h-48 sm:h-60'>
        <Image
          src='/naturedesign.jpg'
          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw'
        />
      </div>
      {body && (<>
        <hr />
        <div className="px-2 flex flex-col h-40">
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
