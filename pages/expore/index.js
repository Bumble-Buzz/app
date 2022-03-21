import { useEffect, useState, useReducer } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '@/components/Api';
import { useAuth } from '@/contexts/AuthContext';
import NftCard from '@/components/nftAssets/NftCard';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import { FilterPanel, FILTER_TYPES } from '@/components/FilterPanel';
import PageError from '@/components/PageError';
import Unauthenticated from '@/components/Unauthenticated';
import { CATEGORIES } from '@/enum/Categories';
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


const BATCH_SIZE = 20;

export default function Explore({ rawSaleIds }) {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

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
  
  useEffect(() => {
    getSales();
  }, []);


  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [searchTimer, setSearchTimer] = useState(null)
  const [searching, setSearching] = useState(false);
  const [apiSortKey, setApiSortKey] = useState(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);

  // on scroll fetch data
  const { observe } = useInView({
    threshold: 0,
    onEnter: async ({ unobserve }) => {
      console.log('onEnter 1');
      if (!search) {
        console.log('onEnter 2');
        if (!exclusiveStartKey) {
          console.log('onEnter 3');
          if (assets.length > filteredAssets.length) {
            console.log('onEnter 4');
            updateFilterAssets();
          } else {
            unobserve();
          }
        }
        setApiSortKey(exclusiveStartKey);
      }
    },
  });

  // fetch data from database using SWR
  useSWRInfinite(
    (pageIndex, previousPageData) => {
      return API.swr.sale.ids(apiSortKey.id, BATCH_SIZE);
    },
    API.swr.fetcher,
    {
      onSuccess: async (_data) => {
        const lastEle = _data[_data.length - 1];
        setExclusiveStartKey(lastEle.LastEvaluatedKey);

        const payload = { ids: lastEle.Items };
        const {data} = await API.asset.batch(payload);
        setAssets([...assets, ...data.Items]);
        setFilteredAssets([...filteredAssets, ...data.Items]);
      },
      ...API.swr.options
    }
  );

  const getSales = async () => {
    // const arr = getRandomBatch();
    setExclusiveStartKey(rawSaleIds.LastEvaluatedKey);
    const payload = { ids: rawSaleIds.Items };
    const {data} = await API.asset.batch(payload);
    setAssets(data.Items);
    setFilteredAssets(data.Items);
  };

  const getRandomBatch = () => {
    const rawSaleIdsLength = rawSaleIds.Items.length;
    let batchSize = BATCH_SIZE;
    if (batchSize > rawSaleIdsLength) batchSize = rawSaleIdsLength;

    let randomArray = [];
    for (let i = 0; i < batchSize; i++) {
      const rand = Math.floor(Math.random() * rawSaleIdsLength);

      randomArray.push(rawSaleIds.Items[rand]);
      rawSaleIds.Items[rand] = rawSaleIds.Items[rawSaleIdsLength-1];
      rawSaleIds.Items.pop();
    }
    return randomArray;
  };

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      AuthContext.state.isNetworkValid
    )
  };

  const updateFilterAssets = async () => {
    const nextBatch = assets.slice(0, filteredAssets.length+BATCH_SIZE);
    console.log('nextBatch', nextBatch);
    setFilteredAssets([...nextBatch]);
  };

  const searchAssets = async (_value) => {
    if (!_value || _value === '') return setFilteredAssets(assets.slice(0, BATCH_SIZE));

    clearTimeout(searchTimer);

    // wait 500 ms until user has stop typing
    const newTimer = setTimeout(async () => {
      let allAssets = assets;
      let filteredAssets = [];
      let latestSortKey = exclusiveStartKey;
      setSearching(true);
      while (filteredAssets.length === 0) {
        filteredAssets = allAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);
  
        if (filteredAssets.length > 0) break;
        if (!latestSortKey) break;
  
        // fetch next batch from db
        const {data: saleIds} = await API.sale.ids(latestSortKey.id, BATCH_SIZE);
        latestSortKey = saleIds.LastEvaluatedKey;
  
        const payload = { ids: saleIds.Items };
        const nextAssets = await API.asset.batch(payload);
        allAssets.push(...nextAssets.data.Items);
      }
      setSearching(false);
      setAssets([...allAssets]);
      setFilteredAssets([...filteredAssets]);
      setExclusiveStartKey(latestSortKey);
    }, 500);

    setSearchTimer(newTimer);
  };


  return (
    <ContentWrapper>

    {/* <div className='flex flex-col'>
      <p onClick={() => console.log(searching)}>searching</p>
      <p onClick={() => console.log(rawSaleIds)}>rawSaleIds</p>
      <p onClick={() => console.log(assets)}>assets</p>
      <p onClick={() => console.log(filteredAssets)}>filteredAssets</p>
      <p onClick={() => console.log(apiSortKey)}>apiSortKey</p>
      <p onClick={() => console.log(exclusiveStartKey)}>exclusiveStartKey</p>
    </div> */}

      {/* Page Content */}
      <div className='flex flex-col sm:flex-row w-full'>

        <div className="-px-2 -ml-2 bg-white">
          <FilterPanel filters={filters} state={state} dispatch={dispatch} />
        </div>

        <div className="px-2 bg-white w-full">

          {/* top elements */}
          <div className='flex flex-wrap gap-2 justify-start items-top'>
            {search && (<div className="">
              <ButtonWrapper classes="py-2 px-4 border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0" onClick={() => {
                setSearch(''); searchAssets('');
              }}>
                {search}
                <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
              </ButtonWrapper>
            </div>)}
          </div>

          <div className='flex flex-wrap gap-2 justify-start items-top'>
            <div className="flex-1">
              <InputWrapper
                type="search"
                id="page-search"
                name="page-search"
                placeholder="Search by name"
                aria-label="page-search"
                aria-describedby="page-search"
                classes="w-full"
                value={search}
                onChange={(e) => {setSearch(e.target.value); searchAssets(e.target.value);}}
              />
            </div>
          </div>

          {/* assets */}
          <div className='py-2 flex flex-wrap gap-4 justify-center items-center'>
            {searching && <PageError>Searching...</PageError>}
            {!searching && filteredAssets.length === 0 && <PageError>No record found</PageError>}
            {!searching && filteredAssets.map((asset, index) => {
              return (
                <NftCard
                  key={index}
                  innerRef={index === filteredAssets.length - 1 ? observe : null}
                  link={`/asset/${asset.contractAddress}/${asset.tokenId}`}
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
                      <div className="flex-1 truncate">{asset.collectionName}</div>
                      <div className="truncate"></div>
                    </div>
                    <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                      <div className="grow w-full truncate">Owner</div>
                      <div className="truncate">{asset.owner}</div>
                    </div>
                  </>)}
                  footer={(<>
                    <div className="flex-1 truncate">{asset.config.name}</div>
                    <div className="truncate">{asset.config.name}</div>
                  </>)}
                />
              )
            })}
          </div>
        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.sale.ids('null', BATCH_SIZE);
  return {
    props: {
      rawSaleIds: data,
      session: await getSession(context)
    }
  }
}
