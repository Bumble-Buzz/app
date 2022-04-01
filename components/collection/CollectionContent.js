import { useEffect, useState, useReducer } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import { FilterPanel, FILTER_TYPES } from '@/components/FilterPanel';
import DropDown from '@/components/navbar/DropDown';
import Toast from '@/components/Toast';
import Sort from '@/utils/Sort';
import { CATEGORIES } from '@/enum/Categories';
import NftCard from '@/components/nftAssets/NftCard';
import { ShieldCheckIcon, ShieldExclamationIcon, XIcon } from '@heroicons/react/solid';


const searchItems = (state, action) => {
  switch(action.payload.item) {
    case 'searchBar':
      state.search.items.searchBar = action.payload.searchBar;
      return state
    case 'searchBarClear':
      const newState = JSON.parse(JSON.stringify(state));
      newState.search.items.searchBar = null;
      return newState
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


export default function CollectionContent({ initialData, collectionData }) {
  const ROUTER = useRouter();

  const searchFilterApply = (e, _override) => {
    e.preventDefault();

    console.log('state.search.items.searchBar', state.search.items.searchBar);
  }

  const priceFilterApply = (e) => {
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
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [apiSortKey, setApiSortKey] = useState(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);

  // on scroll fetch data
  const { observe } = useInView({
    threshold: 0,
    onEnter: async ({ unobserve }) => {
      if (!search) {
        if (!exclusiveStartKey) {
          unobserve();
        }
        setApiSortKey(exclusiveStartKey);
      }
    },
  });

  // fetch data from database using SWR
  useSWRInfinite(
    (pageIndex, previousPageData) => {
      return API.swr.asset.collection(collectionData.contractAddress, apiSortKey.tokenId, 20);
    },
    API.swr.fetcher,
    {
      onSuccess: (_data) => {
        const lastEle = _data[_data.length - 1];
        setAssets([...assets, ...lastEle.Items]);
        setFilteredAssets([...filteredAssets, ...lastEle.Items]);
        setExclusiveStartKey(lastEle.LastEvaluatedKey);
      },
      ...API.swr.options
    }
  );

  useEffect(() => {
    if (initialData) {
      setAssets(initialData.Items);
      setFilteredAssets(initialData.Items);
      setExclusiveStartKey(initialData.LastEvaluatedKey);
    }
  }, [initialData]);

  const updateFilteredAssets = async (_value) => {
    if (!_value || _value === '') return setFilteredAssets(assets);

    let newAssets = assets;
    let filteredAssets = [];
    let latestSortKey = exclusiveStartKey;
    while (filteredAssets.length === 0) {
      filteredAssets = newAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);

      if (filteredAssets.length > 0) break;
      if (!latestSortKey) break;

      // fetch next batch from db
      const nextAssets = await API.asset.collection(collectionData.contractAddress, latestSortKey.tokenId, 20);

      newAssets.push(...nextAssets.data.Items);
      latestSortKey = nextAssets.data.LastEvaluatedKey;
    }
    setAssets([...newAssets]);
    setFilteredAssets([...filteredAssets]);
    setExclusiveStartKey(latestSortKey);
  };
  
  const getItem = (itemId) => {
    switch(itemId) {
      case 1:
        return {
          label: 'Name: Ascending',
          action: () => setFilteredAssets([...Sort.sortString(filteredAssets, ['config','name'], Sort.order.ASCENDING)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 2:
        return {
          label: 'Name: Descending',
          action: () => setFilteredAssets([...Sort.sortString(filteredAssets, ['config','name'], Sort.order.DESCENDING)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 3:
        return {
          label: 'Artist Commission: Low to High',
          action: () => setFilteredAssets([...Sort.sortNumber(filteredAssets, ['commission'], Sort.order.ASCENDING)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 4:
        return {
          label: 'Artist Commission: High to Low',
          action: () => setFilteredAssets([...Sort.sortNumber(filteredAssets, ['commission'], Sort.order.DESCENDING)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      default:
        return {};
    };
  };


  return (
    <div className='flex flex-col sm:flex-row'>

{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p> */}
{/* <p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p> */}
{/* <p onClick={() => {console.log('assets', assets)}}>See assets</p> */}
{/* <p onClick={() => {console.log('filteredAssets', filteredAssets)}}>See filteredAssets</p> */}

      {/* filter panel */}
      <div className="-px-2 -ml-2 bg-white">
        <FilterPanel filters={filters} state={state} dispatch={dispatch} />
      </div>

      <div className="px-2 bg-white w-full">

        {/* above search bar */}
        <div className='flex flex-row flex-wrap gap-2 justify-between items-top'>
          {/* filter button */}
          <div className='flex flex-nowrap gap-2 justify-start items-top'>
            {search && (<div className="">
              <ButtonWrapper classes="py-2 px-4 border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0" onClick={() => {
                setSearch(''); updateFilteredAssets('');
              }}>
                {search}
                <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
              </ButtonWrapper>
            </div>)}
          </div>
          {/* sort dropdown */}
          <div className='flex flex-nowrap gap-2 justify-start items-top w-1/2'>
            <DropDown
              title='Sort By' items={[1,2,3,4]} getItem={getItem}
              titleStyle='p-2 flex flex-row justify-between font-thin w-full border'
              menuStyle='right-0 w-full z-10 mt-0 origin-top-right'
            />
          </div>
        </div>


        {/* search bar */}
        <div className='flex flex-nowrap gap-2 justify-start items-top'>
          <div className="flex-1">
            <InputWrapper
              type="search"
              id="created-search"
              name="created-search"
              placeholder="Search by name"
              aria-label="created-search"
              aria-describedby="created-search"
              classes="w-full"
              value={search}
              onChange={(e) => {setSearch(e.target.value); updateFilteredAssets(e.target.value);}}
            />
          </div>
        </div>

        {/* content */}
        <div className='py-2 flex flex-wrap gap-4 justify-center items-center'>
          {filteredAssets.map((asset, index) => {
            return (
              <div
                key={index}
                className='w-full grow w-36 xsm:w-40 sm:w-60 max-w-xs border rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 cursor-pointer'
                ref={index === filteredAssets.length - 1 ? observe : null}
                onClick={() => ROUTER.push(`/asset/${collectionData.contractAddress}/${asset.tokenId}`)}
              >
                <NftCard
                  header={(<>
                    <div className="flex-1 font-bold text-purple-500 text-xl truncate">{asset.config.name}</div>
                    <div className='flex items-center'>
                      {asset.collectionId === 1 && <ShieldExclamationIcon className="w-5 h-5" fill="#ff3838" alt="unverified" title="unverified" aria-hidden="true" />}
                      {asset.collectionId !== 1 && <ShieldCheckIcon className="w-5 h-5" fill="#33cc00" alt="verified" title="verified" aria-hidden="true" />}
                    </div>
                  </>)}
                  image={asset.config.image}
                  body={(<>
                    <div className="flex flex-nowrap flex-row gap-2 text-left">
                      {/* <div className="flex-1 truncate">COLLECTION NAME HERE</div> */}
                      <div className="truncate"></div>
                    </div>
                    <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                      <div className="flex-1">ID</div>
                      <div className="truncate">{asset.tokenId}</div>
                    </div>
                    <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                      <div className="flex-1">Owner</div>
                      <div className="truncate">
                        {asset.ownerName && (<Link href={`/profile/${asset.owner}`} passHref={true}><a className='text-blue-500'>{asset.ownerName}</a></Link>)}
                        {!asset.ownerName && (<Link href={`/profile/${asset.owner}`} passHref={true}><a className='text-blue-500'>{asset.owner}</a></Link>)}
                      </div>
                    </div>
                  </>)}
                  // footer={(<>
                  //   <div className="flex-1 truncate">{asset.config.name}</div>
                  //   <div className="truncate">{asset.config.name}</div>
                  // </>)}
                />
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
