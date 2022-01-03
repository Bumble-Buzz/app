import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import WALLTET from '../utils/wallet';

import AvaxTradeNftAbi from '../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json'

export default function Home() {
  // NFT contract states
  const [maxSupply, setMaxSupply] = useState('10,000');
  const [mintedSupply, setMintedSupply] = useState('0');

  const [mintCounter, setMintCounter] = useState(1);
  const MAX_MINT_AMOUNT = 5;
  const MIN_MINT_AMOUNT = 1;
  const COST = 0.5;

  useEffect(() => {
    getMaxSupply();
    getMintedSupply();
  }, []);

  const getMaxSupply = async () => {
    console.log('start - getMaxSupply');
    if (!await WALLTET.isNetworkValid()) {
      console.error('Wrong network, switch to Avalanche');
      return;
    }

    // const provider = WALLTET.getDefaultProvider();
    // const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, provider);
    const signer = await WALLTET.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);
    const val = await contract.getMaxSupply();
    setMaxSupply(val.toLocaleString(undefined,0));
    console.log('end - getMaxSupply');
  };

  const getMintedSupply = async () => {
    console.log('start - getMintedSupply');
    if (!await WALLTET.isNetworkValid()) {
      console.error('Wrong network, switch to Avalanche');
      return;
    }

    // const provider = WALLTET.getDefaultProvider();
    // const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, provider);
    const signer = await WALLTET.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);
    const val = await contract.totalSupply();
    setMintedSupply(val.toLocaleString(undefined,0));
    console.log('end - getMintedSupply');
  };

  const mintNft = async () => {
    console.log('start - mintNft');
    if (!await WALLTET.isNetworkValid()) {
      console.error('Wrong network, switch to Avalanche');
      return;
    }

    const signer = await WALLTET.getSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);

    const finalCost = COST*mintCounter;
    const price = ethers.utils.parseUnits(finalCost.toString(), 'ether');
    const address = await signer.getAddress();
    const transaction = await contract.mint(address, mintCounter, {
      value: price
    });
    await transaction.wait();
    console.log('end - mintNft');
  };

  const handleClickAdd = (e) => {
    e.preventDefault();
    if (mintCounter < MAX_MINT_AMOUNT) {
      setMintCounter(mintCounter+1);
    }
  };

  const handleClickSubtract = (e) => {
    e.preventDefault();
    if (mintCounter > MIN_MINT_AMOUNT) {
      setMintCounter(mintCounter-1);
    }
  };

  return (
    <main className="w-full flex self-start flex-col pl-4 pr-4 mt-10 mb-10">
      <div className="w-full rounded overflow-hidden shadow-lg bg-grayDark flex flex-col p-6 md:py-8 lg:py-12 xl:py-16 md:px-8 lg:px-12 xl:px-20">
        <div className="flex bg-grayDark" style={{minHeight: '500px'}}>
          <div className="flex items-center text-center lg:text-left px-8 md:px-12 lg:w-1/2">
            <div className="flex flex-col">
              <div className="my-2">
                <h2 className="text-3xl font-semibold text-gray-800 md:text-4xl">Collect, create, and sell <span className="text-indigo-600">priceless NFTs!</span></h2>
              </div>
              <div className="my-2">
                <p className="mt-2 text-sm text-gray-500 md:text-base">
                  AvaxTrade is a NFT Marketplace on the Avalanche blockchain.
                  Collect a unique NFT, or create your own. Put an NFT up for sale. You can do it all on AvaxTrade!
                </p>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap justify-center">
                  <div>
                    <button onClick={mintNft} className="my-1 mx-4 px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800" href="#">Explore</button>
                  </div>
                  <div>
                    <button onClick={mintNft} className="my-1 mx-4 px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800" href="#">Sell</button>
                  </div>
                  <div>
                    <button onClick={mintNft} className="my-1 mx-4 px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800" href="#">Create</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/2" style={{clipPath: 'polygon(10% 0, 100% 0%, 100% 100%, 0 100%)'}}>
            {/* <div className="h-full object-cover" style={{backgroundImage: 'url(/avocado.jpg)'}}>
              <div className="h-full bg-black opacity-25"></div>
            </div> */}
            <Image src={'/avocado.jpg'} alt='avocado' width='612' height='473' />
          </div>
        </div>
      </div>
    </main>
  )
}
