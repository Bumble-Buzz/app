import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FilterPanel, FILTER_TYPES } from '../FilterPanel';
import Toast from '../Toast';
import { CATEGORIES } from '../../enum/Categories';
import WalletUtil from '../wallet/WalletUtil';
import API from '../Api';
import IPFS from '../../utils/ipfs';

import SAMPLE_IMAGE from '../../public/avocado.jpg';

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

const typeItems = (state, action) => {
  let newState;
  switch(action.payload.item) {
    case 'buyNow':
      newState = JSON.parse(JSON.stringify(state));
      newState.type.items.buyNow = !state.type.items.buyNow;
      console.log('newState.type.items.buyNow', newState.type.items.buyNow);
      return newState
    case 'auction':
      newState = JSON.parse(JSON.stringify(state));
      newState.type.items.auction = !state.type.items.auction;
      console.log('newState.type.items.auction', newState.type.items.auction);
      return newState
    default:
      return state
  }
};

const priceItems = (state, action) => {
  switch(action.payload.item) {
    case 'min':
      state.price.items.min = action.payload.min;
      return state
    case 'max':
      state.price.items.max = action.payload.max;
      return state
    default:
      return state
  }
};

const categoriesItems = (state, action) => {
  let newState;
  if (action.payload.item && CATEGORIES[action.payload.item]) {
    newState = JSON.parse(JSON.stringify(state));
    newState.categories.items[action.payload.item] = !state.categories.items[action.payload.item];
    console.log(`newState.categories.items[${action.payload.item}]`, newState.categories.items[action.payload.item]);
    return newState
  } else {
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
    case 'type':
      newState = JSON.parse(JSON.stringify(state));
      newState.type.isSelected = !state.type.isSelected;
      return newState
    case 'type-items':
      return typeItems(state, action)
    case 'price':
      newState = JSON.parse(JSON.stringify(state));
      newState.price.isSelected = !state.price.isSelected;
      return newState
    case 'price-items':
      return priceItems(state, action)
    case 'categories':
      newState = JSON.parse(JSON.stringify(state));
      newState.categories.isSelected = !state.categories.isSelected;
      return newState
    case 'categories-items':
      return categoriesItems(state, action)
    case 'update':
      newState = JSON.parse(JSON.stringify(state));
      return newState
    default:
      return state
  }
};

const getCategoriesFilters = () => {
  let filters = [];
  Object.getOwnPropertyNames(CATEGORIES).forEach((key) => {
    const filter = { name: key, label: CATEGORIES[key], type: FILTER_TYPES.SWITCH };
    filters.push(filter);
  });
  return filters;
};

const getCategoriesState = () => {
  let state = {};
  Object.getOwnPropertyNames(CATEGORIES).forEach((key) => {
    state[key] = false;
  });
  return state;
};


export default function Created() {
  const ROUTER = useRouter();

  const searchFilterApply = (e) => {
    console.log('searchFilterApply');
    e.preventDefault();

    console.log('state.search.items.searchBar', state.search.items.searchBar);
  }

  const priceFilterApply = (e) => {
    console.log('priceFilterApply');
    e.preventDefault();

    console.log('state.price.items', state.price.items);
    if (!state.price.items.min && !state.price.items.max) {
      Toast.error('Fill out one of the price ranges');
    } else if (state.price.items.min && state.price.items.max && state.price.items.min > state.price.items.max) {
      Toast.error('Price min value must be less than max value');
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
    },
    {
      name: 'type',
      label: 'Type',
      payload: {},
      filterItem: 'type-items',
      items: [
        { name: 'buyNow', label: 'Buy Now', type: FILTER_TYPES.SWITCH_BUTTON },
        { name: 'auction', label: 'Auction', type: FILTER_TYPES.SWITCH_BUTTON }
      ]
    },
    {
      name: 'price',
      label: 'Price',
      payload: { onSubmit: priceFilterApply },
      filterItem: 'price-items',
      items: [
        { name: 'min', label: 'Min', type: FILTER_TYPES.INPUT_FIELD },
        { name: 'max', label: 'Max', type: FILTER_TYPES.INPUT_FIELD },
        {
          name: 'apply',
          label: 'Apply',
          type: FILTER_TYPES.BUTTON,
          payload: { type: "submit" }
        }
      ]
    },
    {
      name: 'categories',
      label: 'Categories',
      payload: {},
      filterItem: 'categories-items',
      items: getCategoriesFilters()
    }
  ];

  const [state, dispatch] = useReducer(reducer, {
    search: {
      isSelected: false,
      items: {
        searchBar: null,
      }
    },
    type: {
      isSelected: false,
      items: {
        buyNow: false,
        auction: false
      }
    },
    price: {
      isSelected: false,
      items: {
        min: null,
        max: null
      }
    },
    categories: {
      isSelected: false,
      items: getCategoriesState()
    }
  });

  const [assets, setAssets] = useState([]);

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
      // Toast.error(e.message);
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
      // console.log('tokenIds', tokenIds.toLocaleString(undefined,0));
      const configs = [];
      await Promise.all( tokenIds.map(async (id) => {
        const tokenURI  = await contract.tokenURI(id);
        // console.log('tokenURI', id, tokenURI);
        // console.log('getValidHttpUrl', IPFS.getValidHttpUrl(tokenURI));
        const payload = { tokenURI: IPFS.getValidHttpUrl(tokenURI) };
        const config = await API.ipfs.get.config(payload);
        configs.push(config.data)
      }) );
      setAssets([...configs]);
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

        {/* <p className="text-gray-700 text-base">Created</p> */}
        {/* <p onClick={getArtistNftIds}>Test getArtistNftIds</p> */}
        {/* <p onClick={getCreatedNfts}>Test getCreatedNfts</p> */}
        <p onClick={() => {console.log('assets', assets)}}>See Assets</p>

        {/* <div className='flex flex-wrap gap-2 justify-center items-center'>
          <div className='relative w-24 sm:w-64 h-24 sm:h-64 max-w-sm rounded overflow-hidden shadow-lg'>
            <Image src={SAMPLE_IMAGE} quality={50} layout='fill' objectFit="cover" sizes='50vw' />
          </div>
        </div> */}

        <div className='flex flex-wrap gap-2 justify-center items-center'>
          {assets && assets.length > 0 && assets.map((asset, index) => {
            return (
              <div className='relative w-24 h-24 sm:w-36 sm:h-36 md:w-60 md:h-60 rounded overflow-hidden shadow-lg' key={index}>
                <Image
                  src={IPFS.getValidHttpUrl(asset.image)}
                  // src={SAMPLE_IMAGE}
                  placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="contain" sizes='50vw'
                />
              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}
