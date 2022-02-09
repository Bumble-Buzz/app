import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import ButtonWrapper from '../wrappers/ButtonWrapper';
import { FilterPanel, FILTER_TYPES } from '../FilterPanel';
import Toast from '../Toast';
import WalletUtil from '../wallet/WalletUtil';
import NftCard from '../nftAssets/NftCard';
import API from '../Api';
import IPFS from '../../utils/ipfs';
import { BadgeCheckIcon, XIcon } from '@heroicons/react/solid';

import AvaxTradeNftAbi from '../../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


const searchItems = (state, action) => {
  switch(action.payload.item) {
    case 'searchBar':
      state.search.items.searchBar = action.payload.searchBar;
      return state
    default:
      return state
  }
};

const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case 'search':
      newState = JSON.parse(JSON.stringify(state));
      newState.search.isSelected = !state.search.isSelected;
      return newState
    case 'search-items':
      return searchItems(state, action)
    default:
      return state
  }
};


export default function Created() {
  const ROUTER = useRouter();

  const searchFilterApply = (e, _override) => {
    e.preventDefault();

    if (state.search.items.searchBar && state.search.items.searchBar !== '' || _override) {
      const newAssets = assets.filter((asset) => {
        if (_override) return true;
        return (asset.name.includes(state.search.items.searchBar));
      });
      setFilteredAssets([...newAssets]);
    } else {
      setFilteredAssets([...assets]);
    }
  };

  const filters = [
    {
      name: 'search',
      label: 'Search',
      payload: { onSubmit: searchFilterApply },
      filterItem: 'search-items',
      items: [
        { name: 'searchBar', label: 'Search by name', type: FILTER_TYPES.SEARCH }
      ]
    }
  ];

  const [state, dispatch] = useReducer(reducer, {
    search: {
      isSelected: true,
      items: {
        searchBar: null,
      }
    }
  });

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);

  useEffect(() => {
    getCreatedNfts();
  }, [ROUTER.query.wallet]);

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
      setAssets([...configs]);
      setFilteredAssets([...configs]);
    } catch (e) {
      Toast.error(e.message);
      console.error(e);
    }
  };


  return (
    <>
      <div className="-p-2 -ml-2 rounded-lg shadow-lg bg-white">
        <FilterPanel filters={filters} state={state} dispatch={dispatch} />
      </div>
      <div className="p-1 rounded-lg shadow-lg bg-white grow">

        {state.search.items.searchBar && (
          <div className='px-4 flex flex-wrap gap-2 justify-start items-center'>
            <ButtonWrapper classes="py-2 px-4 border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0" onClick={(e) => {
              dispatch({ type: 'search-items', payload: { item: 'searchBar', searchBar: null } });
              searchFilterApply(e, true);
            }}>
              {state.search.items.searchBar}
              <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
            </ButtonWrapper>
          </div>
        )}

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
                    <div className="flex-1 truncate">ID</div>
                    <div className="truncate">#34</div>
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
