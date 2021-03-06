import Image from 'next/image';
import { useRouter } from 'next/router';
import IPFS from '@/utils/ipfs';


export default function AssetImage({children, header, image, body, footer, zIndex = 'z-0'}) {
  const ROUTER = useRouter();

  return (
    <>
      {header && (<>
        <div className="py-1 pl-2 pr-1 flex flex-nowrap flex-row gap-2 text-left">
          {header}
        </div>
        <hr />
      </>)}
      <div className={`block ${zIndex}`}>
        <Image
          src={IPFS.getValidHttpUrl(image)}
          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado'
          layout="responsive" sizes="50vw" width="64" height="64"
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
    </>
  )
}
