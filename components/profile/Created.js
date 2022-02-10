import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import ButtonWrapper from '../wrappers/ButtonWrapper';
import InputWrapper from '../wrappers/InputWrapper';
import Toast from '../Toast';
import WalletUtil from '../wallet/WalletUtil';
import NftCard from '../nftAssets/NftCard';
import API from '../Api';
import IPFS from '../../utils/ipfs';
import { BadgeCheckIcon, XIcon } from '@heroicons/react/solid';

import AvaxTradeNftAbi from '../../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function Created() {
  const ROUTER = useRouter();

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(async () => {
    await getCreatedNfts();
  }, []);

  // useEffect(() => {
  //   // console.log('assets', assets);
  //   // console.log('filteredAssets', filteredAssets);
  //   const newAssets = assets.filter((asset) => asset.name.toLowerCase().indexOf(search.toLowerCase()) >= 0);
  //   setFilteredAssets(newAssets);
  // }, [search]);

  const updateFilteredAssets = (_value) => {
    if (_value && _value !== '') {
      const newAssets = assets.filter((asset) => asset.name.toLowerCase().indexOf(_value.toLowerCase()) >= 0);
      setFilteredAssets(newAssets);
    } else {
      setFilteredAssets(assets);
    }
  };

  const getArtistNftIds = async () => {
    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);
    let tokenIds = 0;
    try {
      tokenIds = await contract.getArtistNfts(ROUTER.query.wallet);
    } catch (e) {
      console.error(e);
      throw(e);
    }
    return tokenIds
  };

  const getCreatedNfts = async () => {
    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, AvaxTradeNftAbi.abi, signer);

    try {
      const tokenIds = await getArtistNftIds();
      const configs = [];
      await Promise.all( tokenIds.map(async (id) => {
        const tokenURI  = await contract.tokenURI(id);
        const payload = { tokenURI: IPFS.getValidHttpUrl(tokenURI) };
        const config = await API.ipfs.get.config(payload);
        configs.push(config.data)
      }) );
      setAssets(configs);
      setFilteredAssets(configs);
    } catch (e) {
      Toast.error(e.message);
      console.error(e);
    }
  };


  return (
    <>
      <div className="p-1 rounded-lg shadow-lg bg-white grow">

        <div className='py-2 flex flex-nowrap gap-2 justify-start items-center'>
          <InputWrapper
            type="search"
            id="created-search"
            name="created-search"
            placeholder="Search by name"
            aria-label="created-search"
            aria-describedby="created-search"
            classes="w-full"
            value={search}
            onChange={(e) => {setSearch(e.target.value); updateFilteredAssets(e.target.value); }}
          />
        </div>

        <div className='flex flex-wrap gap-2 justify-center items-center'>
          {filteredAssets && filteredAssets.length > 0 && filteredAssets.map((asset, index) => {
            return (
              <NftCard
                key={index}
                header={(<>
                  <div className="flex-1 font-bold text-purple-500 text-xl truncate">{asset.name}</div>
                  <div className='flex items-center'>
                    <BadgeCheckIcon className="w-5 h-5" fill="#33cc00" alt="verified" title="verified" aria-hidden="true" />
                  </div>
                </>)}
                image={asset.image}
                body={(<>
                  <div className="flex flex-nowrap flex-row gap-2 text-left">
                    <div className="flex-1 truncate">COLLECTION NAME HERE</div>
                    <div className="truncate"></div>
                  </div>
                  <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                    <div className="flex-1 truncate">Owner</div>
                    <div className="truncate">walletId</div>
                  </div>
                </>)}
                footer={(<>
                  <div className="flex-1 truncate">{asset.name}</div>
                  <div className="truncate">{asset.name}</div>
                </>)}
              />
            )
          })}
        </div>

      </div>
    </>
  )
}
