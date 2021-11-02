import { useEffect, useState } from 'react';
import Image from 'next/image';
import IPFS from '../../utils/ipfs';

function AssetList({images, tokenUris}) {
  const [nftAssets, setNftAssets] = useState([]);
  // console.log('AssetList');
  // console.log('tokenUris', tokenUris);

  useEffect(() => {
    assembleUriData();
  }, [tokenUris]);

  const fetchUriData = async (uriUrl) => {
    return fetch('/api/post2', {
      method: 'POST',
      body: JSON.stringify({ uriUrl }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json());
  };

  const assembleUriData = async () => {
    const TOKEN_URI_DATA = [];

    // let response = await fetch('/api/get');
    // const getData = await response.json();
    // console.log('getData', getData);

    

    let TOKEN_URI_PROMISES = [];
    // tokenUris.forEach(tokenUri => {
    // for (const tokenUri of tokenUris) {
      // const uriUrl = IPFS.getValidHttpUrl(tokenUri);

      const response = await fetch('/api/post2', {
        method: 'POST',
        body: JSON.stringify({ tokenUris }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // const postData = await response.json();
      // console.log('postData', postData);
      TOKEN_URI_PROMISES = await response.json();
      // TOKEN_URI_PROMISES.push(postData);
      // break;




    //   const uriUrl = IPFS.getValidHttpUrl(tokenUri);
      // console.log('uriUrl', uriUrl);
      // const uriDataPromise = fetchUriData(uriUrl);
      // TOKEN_URI_PROMISES.push(uriDataPromise);
    //   // fetch(uriUrl)
    //   //   .then(data => data.json())
    //   //   .then(data => console.log(data))
    //     // .then((data) => { TOKEN_URI_DATA.push(data) });
    //     // .then((data) => { tokenUriData = data });
    //     // .then((data) => { setUriData(data) });
    // };
    // console.log('TOKEN_URI_PROMISES', TOKEN_URI_PROMISES);
    setNftAssets(TOKEN_URI_PROMISES);
    // await Promise.all(TOKEN_URI_PROMISES).then(async (_uriData) => {
    //   console.log('_uriData', _uriData);
    //   setNftAssets(_uriData);
    // });
  };


  return (
    <div className='flex flex-wrap gap-2 justify-center items-center'>
      {nftAssets.length > 0 && nftAssets.map((imageUrl, index) => {
        return (
          <div className='w-64 grid grid-row-2 gap-0 max-w-sm rounded overflow-hidden shadow-lg' key={index}>
            <div className='relative w-64 h-64'>
              {/* <div className="absolute inset-0 z-10 flex transition duration-200 ease-in opacity-0 hover:opacity-100">
                <div className='absolute inset-0 bg-black opacity-20'></div>
                <div className="mx-auto text-white z-10 self-center uppercase tracking-widest text-sm">
                  Hello World
                </div>
              </div> */}
              <Image src={IPFS.getValidHttpUrl(imageUrl.image)} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />
            </div>
              <div className='px-4 py-2'>
                <div className='font-bold text-purple-500 text-base'>Sample image text</div>
              </div>
          </div>
        )
      })}
      
    </div>
  )
}

export default AssetList

