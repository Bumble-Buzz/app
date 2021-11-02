import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import NftAsset from '../components/NftAsset';
import AssetList from '../components//nftAssets/AssetList';
import WALLTET from '../utils/wallet';
import IPFS from '../utils/ipfs';


import AvaxocadoAbi from '../artifacts/contracts/AvaxocadoNft.sol/AvaxocadoNft.json'

export default function MyNft() {
  const [tokenIds, setTokenIds] = useState([]);
  const [tokenUris, setTokenUris] = useState([]);
  const [nftAssets, setNftAssets] = useState([]);

  useEffect(() => {
    getTokenIds();
  }, []);

  const getTokenIds = async () => {
    // console.log('getTokenIds');
    const signer = await WALLTET.getSigner();

    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxocadoAbi.abi, signer);
    const address = await signer.getAddress();

    // // reveal contract for testing
    // await contract.setContractRevealState(true);

    let TOKEN_URIs = [];
    const myTokenIds = await contract.walletTokens(address);
    for (const myTokenId of myTokenIds) {
      const parsedTokenId = parseInt(myTokenId, 10);
      // console.log('parsedTokenId', parsedTokenId);
      const uri = await getTokenUri(parsedTokenId);
      // console.log('uri', uri);
      TOKEN_URIs.push(uri);
      // console.log('TOKEN_URIs1', TOKEN_URIs);
    };

    // console.log('TOKEN_URIs2', TOKEN_URIs);
    setTokenUris(TOKEN_URIs);
  };

  const getTokenUri = async (tokenId) => {
    // console.log('tokenId passed in:', tokenId);
    const signer = await WALLTET.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxocadoAbi.abi, signer);

    const tokenUri = await contract.tokenURI(tokenId);
    // console.log('tokenUri with token', tokenUri);
    return tokenUri;
  };

  const images = [
    '/mountain.jpeg',
    '/mountain.jpeg',
    '/mountain.jpeg',
    '/mountain.jpeg',
    '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg',
    // '/mountain.jpeg'
  ];

  return (
    <main className="w-full flex self-start flex-col pl-4 pr-4 mt-10 mb-10">
      <div className="w-full rounded overflow-hidden shadow-lg bg-grayDark flex flex-col p-6 md:py-8 lg:py-12 xl:py-16 md:px-8 lg:px-12 xl:px-20">
        <div className="bg-grayDark" style={{minHeight: '500px'}}>
          {/* <div>tokenIds: {tokenIds}</div> */}
          {/* <div>nftAssets: {nftAssets}</div> */}
          <AssetList images={images} tokenUris={tokenUris} />
          {/* <div className='flex flex-wrap gap-2 justify-center items-center'>
            {images && images.map((imageUrl, index) => {
              return (
                <NftAsset key={index} url={imageUrl} index={index} tokenUri={tokenUris[index]} />
              )
            })}
          </div> */}
        </div>
      </div>
    </main>
  )
}


export async function getStaticProps() {
  // console.log('getStaticProps: sdjhsdfjsgd sjd');
  // const response = await fetch('https://gateway.pinata.cloud/ipfs/QmW8vjBKPYt7fQZ4yNjdxe1RbE3Ty3W9oMBc7upq5Jrg3o/1.json');
  // const data = await response.json();
  // console.log('getStaticProps: ', data);
  return {
    props: {
      users: ''
    }
  }
}