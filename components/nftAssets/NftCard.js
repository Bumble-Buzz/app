import Image from 'next/image';
import { useRouter } from 'next/router';
import IPFS from '@/utils/ipfs';


export default function NftCard({children, innerRef, link, header, image, body, footer}) {
  const ROUTER = useRouter();

  return (
    <div
      className='w-full grow w-36 xsm:w-40 sm:w-60 max-w-xs border rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 cursor-pointer'
      ref={innerRef}
      onClick={() => ROUTER.push(link)}
    >
      {header && (<>
        <div className="pl-2 pr-1 flex flex-nowrap flex-row gap-2 text-left">
          {header}
        </div>
        <hr />
      </>)}
      <div className='relative h-24 sm:h-30 md:h-40'>
        <Image
          src={IPFS.getValidHttpUrl(image)}
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
