import { useState } from 'react';
import Image from 'next/image';
import IPFS from '@/utils/ipfs';

function NftAsset({url, index, tokenUri}) {
  const [uriData, setUriData] = useState({});

  console.log('NftAsset');

  // console.log('tokenUri', tokenUri);
  // if (tokenUri) {
  //   const uriUrl = IPFS.getValidHttpUrl(tokenUri);
  //   console.log('uriUrl', uriUrl);
  //   let tokenUriData;
    // fetch(uriUrl)
      // .then(data => data.json())
      // .then((data) => { console.log(data) });
      // .then((data) => { tokenUriData = data });
      // .then((data) => { setUriData(data) });
    // console.log('tokenUriData', tokenUriData);
    // setUriData(tokenUriData);
  // }
  return (
    <div className='w-64 grid grid-row-2 gap-0 max-w-sm rounded overflow-hidden shadow-lg'>
      <div className='relative w-64 h-64'>
        {/* <div className="absolute inset-0 z-10 flex transition duration-200 ease-in opacity-0 hover:opacity-100">
          <div className='absolute inset-0 bg-black opacity-20'></div>
          <div className="mx-auto text-white z-10 self-center uppercase tracking-widest text-sm">
            Hello World
          </div>
        </div> */}
        <Image src={url} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />
      </div>
        <div className='px-4 py-2'>
          <div className='font-bold text-purple-500 text-base'>Sample image text</div>
        </div>
    </div>
  )
}

export default NftAsset