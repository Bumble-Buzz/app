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
import { CHAIN_ICONS } from '@/enum/ChainIcons';
import NftCard from '@/components/nftAssets/NftCard';
import { ShieldCheckIcon, ShieldExclamationIcon, XIcon } from '@heroicons/react/solid';
const _ = require('lodash');


const BATCH_SIZE = 20;
let APPLIED_FILTERS = {};

const _doesArrayInclude = (_array, _identifier = {}) => {
  const match = _array.find((arrayElement) => {
      return _.isEqual(arrayElement, _identifier);
  });
  return match == undefined ? false : true;
};


export default function CollectionContent({ initialData, collectionData }) {
  const ROUTER = useRouter();

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [searchTimer, setSearchTimer] = useState(null)
  const [apiSortKey, setApiSortKey] = useState(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);

  // on scroll fetch data
  const { observe } = useInView({
    threshold: 0,
    onEnter: async ({ unobserve }) => {
      if (!exclusiveStartKey) {
        if (assets.length > filteredAssets.length) {
          updateFilterAssets();
        } else {
          unobserve();
        }
      }
      setApiSortKey(exclusiveStartKey);
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
        applyFilters(JSON.parse(JSON.stringify([...assets, ...lastEle.Items])), { search: search });
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


  /** reducer methods **/
  const typeItems = (state, action) => {
    let newState;
    switch(action.payload.item) {
      case 'buyNow':
        newState = JSON.parse(JSON.stringify(state));
        newState.type.items.buyNow = !state.type.items.buyNow;
        return newState
      case 'auction':
        newState = JSON.parse(JSON.stringify(state));
        newState.type.items.auction = !state.type.items.auction;
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

  const reducer = (state, action) => {
    let newState;
    switch(action.type) {
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
      case 'clear':
        APPLIED_FILTERS = {}
        setSearch('');
        newState = JSON.parse(JSON.stringify(state));
        newState.type.items.buyNow = false;
        newState.type.items.auction = false;
        newState.price.items.min = 0;
        newState.price.items.max = 0;
        return newState
      case 'update':
        newState = JSON.parse(JSON.stringify(state));
        return newState
      default:
        return state
    }
  };

  /** filter config **/
  const filterConfig = [
    {
      name: 'type',
      label: 'Type',
      payload: {},
      filterItem: 'type-items',
      items: [
        { name: 'buyNow', label: 'Buy Now', type: FILTER_TYPES.SWITCH_BUTTON },
        { name: 'auction', label: 'Auction', type: FILTER_TYPES.SWITCH_BUTTON }
      ],
      add: async (item, useFilteredAssets = areFiltersSet()) => {
        switch(item) {
          case 'buyNow':
            APPLIED_FILTERS['buyNow'] = true;
            return await filterAssets(useFilteredAssets, (newAssets) => newAssets.filter((asset) => asset.sale && asset.sale.saleType === process.env.NEXT_PUBLIC_SALE_TYPE_IMMEDIATE));
          case 'auction':
            APPLIED_FILTERS['auction'] = true;
            return await filterAssets(useFilteredAssets, (newAssets) => newAssets.filter((asset) => asset.sale && asset.sale.saleType === process.env.NEXT_PUBLIC_SALE_TYPE_AUCTION));
          default:
            return console.error('Filter panel: type add => internal error');
        }
      },
      remove: async (item) => {
        delete APPLIED_FILTERS[item];
        applyFilters(JSON.parse(JSON.stringify(assets)), { search: search });
      }
    },
    {
      name: 'price',
      label: 'Price',
      payload: {
        onSubmit: (e) => {
          e.preventDefault();
      
          if (!filterState.price.items.min && !filterState.price.items.max) {
            Toast.error('Fill out one of the price ranges');
            return false;
          } else if (filterState.price.items.min && filterState.price.items.max && filterState.price.items.min > filterState.price.items.max) {
            Toast.error('Price min value must be less than max value');
            return false;
          }
          dispatch({ type: 'update' });
          return true;
        }},
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
      ],
      add: async (useFilteredAssets = areFiltersSet()) => {
        if (APPLIED_FILTERS.price) useFilteredAssets = false;
        await filterAssets(useFilteredAssets, (newAssets) => newAssets.filter((asset) => {
          if (asset.sale) {
            if (filterState.price.items['min'] > 0 || filterState.price.items['max'] > 0) APPLIED_FILTERS['price'] = true;
            if (filterState.price.items['min'] > 0 && filterState.price.items['max'] > 0) {
              return (asset.sale.price >= filterState.price.items['min'] && asset.sale.price <= filterState.price.items['max']);
            }
            if (filterState.price.items['min'] > 0) return (asset.sale.price >= filterState.price.items['min']);
            if (filterState.price.items['max'] > 0) return (asset.sale.price <= filterState.price.items['max']);
          }
        }));
      },
      remove: async () => {
        delete APPLIED_FILTERS.price;
        applyFilters(JSON.parse(JSON.stringify(assets)), { search: search });
      }
    }
  ];

  /** filter state **/
  const [filterState, dispatch] = useReducer(reducer, {
    type: {
      isSelected: true,
      items: {
        buyNow: false,
        auction: false
      }
    },
    price: {
      isSelected: true,
      items: {
        min: 0,
        max: 0
      }
    }
  });

  const areFiltersSet = () => {
    return (
      filterState.type.items.buyNow || filterState.type.items.auction ||
      filterState.price.items.min > 0 || filterState.price.items.max > 0
    );
  };

  const updateFilterAssets = async () => {
    const filteredAssetTokenIds = [];
    filteredAssets.forEach((asset) => filteredAssetTokenIds.push(asset.tokenId));
    const newFilteredAssets = assets.filter((asset) => {
      return !_doesArrayInclude(filteredAssets, asset);
    });
    const nextBatch = newFilteredAssets.slice(0, BATCH_SIZE);
    applyFilters(JSON.parse(JSON.stringify([...filteredAssets, ...nextBatch])), { search: search });
  };

  const searchFilterAssets = async (_value) => {
    if (!_value || _value === '') {
      if (!areFiltersSet()) return setFilteredAssets(assets.slice(0, BATCH_SIZE));

      applyFilters(JSON.parse(JSON.stringify(assets)), { search: _value });
      return;
    }

    clearTimeout(searchTimer);
    
    const newTimer = setTimeout(async () => {
      await filterAssets(false, (newAssets) => {
        return newAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);
      }, { search: _value });
    }, 500);

    setSearchTimer(newTimer);
  };

  const filterAssets = async (useFilteredAssets = false, filter, options = {}) => {
    return new Promise(async (resolve) => {
      let dbAssets = [];
      let workingAssets = JSON.parse(JSON.stringify(assets));
      if (useFilteredAssets) workingAssets = JSON.parse(JSON.stringify(filteredAssets));
      let newFilteredAssets = [];
      let latestSortKey = exclusiveStartKey;
  
      const dbFetchLimit = 10;
      let dbFetchCount = 0;
      while (newFilteredAssets.length === 0) {
        newFilteredAssets = filter(workingAssets);

        if (newFilteredAssets.length > 0) break;
        if (!latestSortKey) break;
        if (dbFetchCount >= dbFetchLimit) break;
  
        // fetch next batch from db
        const nextAssets = await API.asset.collection(collectionData.contractAddress, latestSortKey.tokenId, 20);
        dbFetchCount++;
  
        workingAssets.push(...nextAssets.data.Items);
        dbAssets.push(...nextAssets.data.Items);
        latestSortKey = nextAssets.data.LastEvaluatedKey;
      }
      setAssets([...assets, ...dbAssets]);
      applyFilters(newFilteredAssets, options); // pass-by-reference and update newFilteredAssets
      setExclusiveStartKey(latestSortKey);

      resolve();
    });
  };

  const applyFilters = (initAssets, options = {}) => {
    let workingAssets = initAssets;
    filterConfig.forEach((filter) => {
      if (filter.name === 'type' && APPLIED_FILTERS.buyNow) {
        workingAssets = workingAssets.filter((asset) => asset.sale && asset.sale.saleType === process.env.NEXT_PUBLIC_SALE_TYPE_IMMEDIATE);
      };
      if (filter.name === 'type' && APPLIED_FILTERS.auction) {
        workingAssets = workingAssets.filter((asset) => asset.sale && asset.sale.saleType === process.env.NEXT_PUBLIC_SALE_TYPE_AUCTION);
      };
      if (filter.name === 'price' && (APPLIED_FILTERS.price)) {
        workingAssets = workingAssets.filter((asset) => {
          if (asset.sale) {
            if (filterState.price.items['min'] > 0 && filterState.price.items['max'] > 0) {
              return (asset.sale.price >= filterState.price.items['min'] && asset.sale.price <= filterState.price.items['max']);
            }
            if (filterState.price.items['min'] > 0) return (asset.sale.price >= filterState.price.items['min']);
            if (filterState.price.items['max'] > 0) return (asset.sale.price <= filterState.price.items['max']);
          }
        });
      };

      // search
      if (options && options.search) {
        workingAssets = workingAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(options.search.toString().toLowerCase()) >= 0);
      }

      // update state
      setFilteredAssets([...workingAssets]);
    });
  }
  
  const getSortDropdownItems = (itemId) => {
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
  const getSortDropdownItemsList = () => {
    let items = [1,2];
    if (Number(collectionData.id) === Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID)) {
        items.push(3);
        items.push(4);
    }
    return items;
  };

  const minMaxFilterButton = (_filterItem, _filterName, _itemName) => {
    if (_filterItem !== 'price-items') return (<></>);

    const minValue = filterState[_filterName].items['min'];
    const maxValue = filterState[_filterName].items['max'];

    if (_itemName === 'min') {
      if (minValue > 0 && maxValue > 0) return (<>{minValue} {'-'} {maxValue}</>);
      if (minValue > 0 && maxValue <= 0) return (<> {'>'} {minValue} </>);
      return (<></>);
    }
    if (_itemName === 'max') {
      if (minValue <= 0 && maxValue > 0) return (<> {'<'} {maxValue} </>);
      return (<></>);
    }
  };

  const isMaxFilterValid = (_filterName, _itemName) => {
    if (_itemName !== 'max') return true;

    const minValue = filterState[_filterName].items['min'];
    const maxValue = filterState[_filterName].items['max'];
    if (minValue <= 0 && maxValue > 0) return true;
    return false;
  };


  return (
    <div className='flex flex-col sm:flex-row'>

{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p> */}
{/* <p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p> */}
{/* <p onClick={() => {console.log('assets', assets)}}>See assets</p> */}
{/* <p onClick={() => {console.log('filteredAssets', filteredAssets)}}>See filteredAssets</p> */}

      {/* filter panel */}
      <div className="-px-2 -ml-2 bg-white">
        <FilterPanel isShowingInit={true} filters={filterConfig} state={filterState} dispatch={dispatch} />
      </div>

      <div className="px-2 bg-white w-full">

        {/* filter button */}
        <div className='mt-1 flex flex-row flex-wrap gap-2 justify-start items-center content-center'>
          {filterConfig && filterConfig.length > 0 && filterConfig.map((filter, index1) => {
            return (
              filter.items && filter.items.length > 0 && filter.name !== 'search' && filter.items.map((item, index) => {
                if (filterState[filter.name].items[item.name] && isMaxFilterValid(filter.name, item.name)) {
                  return (
                    <ButtonWrapper
                      key={index}
                      classes="border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
                      onClick={() => {
                        dispatch({ type: filter.filterItem, payload: { item: item.name, [item.name]: 0 } });
                        if (filter.filterItem === 'price-items') {
                          dispatch({ type: filter.filterItem, payload: { item: 'max', 'max': 0 } });
                          dispatch({ type: 'update' });
                        }
                        filter.remove(item.name);
                      }}
                    >
                      {minMaxFilterButton(filter.filterItem, filter.name, item.name)}
                      {filter.filterItem !== 'price-items' && item.label}
                      <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
                    </ButtonWrapper>
                  )
                }
              })
            )
          })}
          {areFiltersSet() && (
            <ButtonWrapper
              classes="border-inherit rounded-2xl text-black bg-red-300 hover:bg-red-400 focus:ring-0"
              onClick={() => { dispatch({ type: 'clear' }); setFilteredAssets([...assets.slice(0, filteredAssets.length+BATCH_SIZE)]); }}
            >
              Clear All
            </ButtonWrapper>
          )}
        </div>

        <div className='mt-1 flex flex-row flex-nowrap gap-2 justify-between items-center content-center'>
          {/* search bar */}
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
              onChange={(e) => {setSearch(e.target.value); searchFilterAssets(e.target.value);}}
            />
          </div>
          {/* sort dropdown */}
          <div className='flex flex-nowrap flex-1 gap-2 justify-start items-top w-full max-w-md'>
            <DropDown
              title='Sort By' items={getSortDropdownItemsList()} getItem={getSortDropdownItems}
              titleStyle='p-2 flex flex-row justify-between font-thin w-full border border-gray-300'
              menuStyle='right-0 w-full z-10 mt-0 origin-top-right'
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
                    <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                      <div className="flex-1">ID</div>
                      <div className="truncate">{asset.tokenId}</div>
                    </div>
                    <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                      <div className="flex-1">Price</div>
                      <div className="flex flex-row flex-nowrap justify-center items-center">
                      <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                        <div className="truncate">{asset.sale ? asset.sale.price : 0}</div>
                      </div>
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
