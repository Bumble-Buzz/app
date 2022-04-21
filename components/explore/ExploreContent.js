import _ from 'lodash';
import { useEffect, useState, useReducer } from 'react';
import { useRouter } from 'next/router';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import useSWR from 'swr';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import DropDown from '@/components/navbar/DropDown';
import Toast from '@/components/Toast';
import Sort from '@/utils/Sort';
import { useFilter, FILTER_CONTEXT_ACTIONS } from '@/contexts/FilterContext';
import ENUM from '@/enum/ENUM';
import NftCard from '@/components/nftAssets/NftCard';
import { ShieldCheckIcon, ShieldExclamationIcon, XIcon } from '@heroicons/react/solid';


const BATCH_SIZE = 40;
const FILTERS = {
  panel: {},
  page: {}
};

const _doesArrayInclude = (_array, _identifier = {}) => {
  const match = _array.find((arrayElement) => {
      return _.isEqual(arrayElement, _identifier);
  });
  return match == undefined ? false : true;
};


export default function ExploreContent({ initialData }) {
  const FilterContext = useFilter();
  const ROUTER = useRouter();

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [apiSortKey, setApiSortKey] = useState(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);
  const [userInputTimer, setUserInputTimer] = useState(null);

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
      return API.swr.asset.sale.all(apiSortKey.owner, apiSortKey.contractAddress, apiSortKey.tokenId, BATCH_SIZE);
    },
    API.swr.fetcher,
    {
      onSuccess: (_data) => {
        const lastEle = _data[_data.length - 1];
        setAssets([...assets, ...lastEle.Items]);
        const newFilteredAssets = applyFilters([...assets, ...lastEle.Items]);
        setFilteredAssets([...newFilteredAssets]);
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

  // update every time filters change
  useEffect(() => {
    if (FilterContext.state.dirty) {
      const newFilteredAssets = applyFilters([...assets]);
      setFilteredAssets([...newFilteredAssets]);
      FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.DIRTY, payload: { dirty: false } });
    }
  }, [FilterContext.state.dirty]);


  const areCollectionFiltersSet = () => {
    return (FilterContext.state.collections && FilterContext.state.collections.selected && FilterContext.state.collections.selected.length > 0);
  };
  const areCategoryFiltersSet = () => {
    if (!FilterContext.state.categories) return false;
    const exists = Object.getOwnPropertyNames(ENUM.CATEGORIES).filter(key => FilterContext.state.categories[key] === true);
    return (exists && exists.length > 0);
  };
  const areFiltersSet = () => {
    return (
      FilterContext.state.type.buyNow || FilterContext.state.type.auction ||
      FilterContext.state.price.min > 0 || FilterContext.state.price.max > 0 ||
      areCategoryFiltersSet() || areCollectionFiltersSet()
    );
  };

  const updateFilterAssets = async () => {
    const hiddenFilteredAssets = assets.filter((asset) => {
      return !_doesArrayInclude(filteredAssets, asset);
    });

    let startPosition = 0;
    const stepSize = BATCH_SIZE*2;
    let newFilteredAssets;
    const iterationSize = Math.round(hiddenFilteredAssets.length / stepSize);
    for (let i=0; i < iterationSize; i++) {
      let nextBatch;
      if (startPosition+BATCH_SIZE > hiddenFilteredAssets.length) {
        nextBatch = hiddenFilteredAssets.slice(startPosition);
      } else {
        nextBatch = hiddenFilteredAssets.slice(startPosition, startPosition+stepSize);
      }
      startPosition += BATCH_SIZE;
      newFilteredAssets = applyFilters([...filteredAssets, ...nextBatch]);
      if (newFilteredAssets.length > filteredAssets.length) break;
    }
    setFilteredAssets([...newFilteredAssets]);
  };

  const searchFilterAssets = async (_value) => {
    if (!_value || _value === '') {
      if (!areFiltersSet()) return setFilteredAssets(assets.slice(0, BATCH_SIZE));

      const newFilteredAssets= applyFilters([...assets]);
      setFilteredAssets([...newFilteredAssets]);
      return;
    }

    clearTimeout(userInputTimer);
    
    const newTimer = setTimeout(async () => {
      await filterAssets(false, (newAssets) => {
        return newAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);
      });
    }, 500);

    setUserInputTimer(newTimer);
  };

  const filterAssets = async (useFilteredAssets = false, filter) => {
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
        const nextAssets = await API.asset.sale.all(latestSortKey.owner, latestSortKey.contractAddress, latestSortKey.tokenId, BATCH_SIZE);
        dbFetchCount++;

        workingAssets.push(...nextAssets.data.Items);
        dbAssets.push(...nextAssets.data.Items);
        latestSortKey = nextAssets.data.LastEvaluatedKey;
      }
      setAssets([...assets, ...dbAssets]);
      newFilteredAssets = applyFilters([...newFilteredAssets]);
      setFilteredAssets([...newFilteredAssets.slice(0, BATCH_SIZE)]);
      setExclusiveStartKey(latestSortKey);

      resolve();
    });
  };

  const applyFilters = ([...workingAssets]) => {
    // type
    if (FilterContext.state.type.buyNow) {
      workingAssets = workingAssets.filter((asset) => asset.saleType === Number(process.env.NEXT_PUBLIC_SALE_TYPE_IMMEDIATE));
    }
    if (FilterContext.state.type.auction) {
      workingAssets = workingAssets.filter((asset) => asset.saleType === Number(process.env.NEXT_PUBLIC_SALE_TYPE_AUCTION));
    }

    // price
    if (FilterContext.state.price.min > 0 || FilterContext.state.price.max > 0) {
      workingAssets = workingAssets.filter((asset) => {
        if (FilterContext.state.price.min > 0 && FilterContext.state.price.max > 0) {
          return (asset.price >= FilterContext.state.price.min && asset.price <= FilterContext.state.price.max);
        }
        if (FilterContext.state.price.min > 0) return (asset.price >= FilterContext.state.price.min);
        if (FilterContext.state.price.max > 0) return (asset.price <= FilterContext.state.price.max);
      });
    }

    // collections
    if (FilterContext.state.collections) {
      const selectedCollections = FilterContext.state.collections.selected;
      if (selectedCollections.length > 0) {
        workingAssets = workingAssets.filter(asset => {
          return _doesArrayInclude(selectedCollections, asset.collectionId)
        });
      }
    }

    // categories
    if (FilterContext.state.categories) {
      const enabledCategories = Object.getOwnPropertyNames(ENUM.CATEGORIES).filter(key => FilterContext.state.categories[key] === true);
      if (enabledCategories.length > 0) {
        workingAssets = workingAssets.filter((asset) => {
          const category = asset.category.toString().toLowerCase();
          return _doesArrayInclude(enabledCategories, category);
        });
      }
    }

    // search
    if (FILTERS.page.search && FILTERS.page.search !== '') {
      workingAssets = workingAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(FILTERS.page.search.toString().toLowerCase()) >= 0);
    }

    // sort
    if (FILTERS.page.sort) {
      workingAssets = FILTERS.page.sort(workingAssets);
    }

    // return filterd assets
    return [...workingAssets];
  };
  
  const getSortDropdownItems = (itemId) => {
    let sort;
    switch(itemId) {
      case 1:
        sort = (assets) => Sort.sortString(assets, ['config','name'], Sort.order.ASCENDING);
        FILTERS.page.sort = sort;
        return {
          label: 'Name: Ascending',
          action: () => setFilteredAssets([...sort(filteredAssets)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 2:
        sort = (assets) => Sort.sortString(assets, ['config','name'], Sort.order.DESCENDING);
        FILTERS.page.sort = sort;
        return {
          label: 'Name: Descending',
          action: () => setFilteredAssets([...sort(filteredAssets)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 3:
        sort = (assets) => Sort.sortNumber(assets, ['commission'], Sort.order.ASCENDING);
        FILTERS.page.sort = sort;
        return {
          label: 'Artist Commission: Low to High',
          action: () => setFilteredAssets([...sort(filteredAssets)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 4:
        sort = (assets) => Sort.sortNumber(assets, ['commission'], Sort.order.DESCENDING);
        FILTERS.page.sort = sort;
        return {
          label: 'Artist Commission: High to Low',
          action: () => setFilteredAssets([...sort(filteredAssets)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 5:
        sort = (assets) => Sort.sortNumber(assets, ['price'], Sort.order.ASCENDING);
        FILTERS.page.sort = sort;
        return {
          label: 'Price: Low to High',
          action: () => setFilteredAssets([...sort(filteredAssets)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      case 6:
        sort = (assets) => Sort.sortNumber(assets, ['price'], Sort.order.DESCENDING);
        FILTERS.page.sort = sort;
        return {
          label: 'Price: High to Low',
          action: () => setFilteredAssets([...sort(filteredAssets)]),
          icon: (<></>),
          iconOutline: (<></>)
        };
      default:
        console.error('sort dropdown : not a valid sort option');
    };
  };
  const getSortDropdownItemsList = () => {
    let items = [1,2,5,6];
    return items;
  };

  const minMaxFilterButton = (_filter) => {
    const minValue = FilterContext.state.price.min;
    const maxValue = FilterContext.state.price.max;

    if (_filter === 'min') {
      if (minValue > 0 && maxValue > 0) return (<>{'Price: '}{minValue} {'-'} {maxValue}</>);
      if (minValue > 0 && maxValue <= 0) return (<>{'Price: '} {'>'} {minValue} </>);
      return (<></>);
    }
    if (_filter === 'max') {
      if (minValue <= 0 && maxValue > 0) return (<>{'Price: '} {'<'} {maxValue} </>);
      return (<></>);
    }
  };

  const isMaxFilterValid = (_filter) => {
    if (_filter !== 'max') return true;

    const minValue = FilterContext.state.price.min;
    const maxValue = FilterContext.state.price.max;
    if (minValue <= 0 && maxValue > 0) return true;
    return false;
  };

  const createFilterButtons = (_filter, _item) => {
    if (_filter === 'type') return (
      <ButtonWrapper
        classes="border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
        onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CLEAR_SPECIFIC, payload: { filter: _filter, item: _item } }) }
      >
        {_item}
        <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
      </ButtonWrapper>
    );

    if (_filter === 'price') return (
      <ButtonWrapper
        classes="border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
        onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CLEAR_SPECIFIC, payload: { filter: _filter, item: _item } }) }
      >
        {minMaxFilterButton(_item)}
        <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
      </ButtonWrapper>
    );

    if (_filter === 'collections' && areCollectionFiltersSet()) return (
      <ButtonWrapper
        classes="border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
        onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CLEAR_SPECIFIC, payload: { filter: _filter, item: _item } }) }
      >
        {'Collections'}
        <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
      </ButtonWrapper>
    );

    if (_filter === 'categories') return (
      <ButtonWrapper
        classes="border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
        onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CLEAR_SPECIFIC, payload: { filter: _filter, item: _item } }) }
      >
        {_item}
        <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
      </ButtonWrapper>
    );
  };


  return (
    <>
{/* <p onClick={() => {console.log('assets', assets)}}>See assets</p> */}
{/* <p onClick={() => {console.log('filteredAssets', filteredAssets); console.log('filteredAssets', filteredAssets.map((asset) => asset.price));}}>See filteredAssets</p> */}
{/* <p onClick={() => {console.log('FILTERS', FILTERS)}}>FILTERS</p> */}
{/* <p onClick={() => {console.log('FilterContext.state', FilterContext.state)}}>state</p> */}

      {/* filter button */}
      <div className='mt-1 flex flex-row flex-wrap gap-2 justify-start items-center content-center'>
        {areFiltersSet() && FilterContext.state && Object.getOwnPropertyNames(FilterContext.state).map((filter, index) => {
          return (
            FilterContext.state[filter] && Object.getOwnPropertyNames(FilterContext.state[filter]).map((item, index) => {
              if (item === 'selected' || item === 'exclusiveStartKey') return;
              if (!isMaxFilterValid(item)) return;
              if (!FilterContext.state[filter][item]) return;

              return (
                <div key={index}>{createFilterButtons(filter, item)}</div>
                // <ButtonWrapper
                //   key={index}
                //   classes="border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
                //   onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CLEAR_SPECIFIC, payload: { filter: filter, item: item } }) }
                // >
                //   {filter === 'price' ? (minMaxFilterButton(item)) : (<>{item}</>)}
                //   <XIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
                // </ButtonWrapper>
              )
            })
          )
        })}
        {areFiltersSet() && (
          <ButtonWrapper
            classes="border-inherit rounded-2xl text-black bg-red-300 hover:bg-red-400 focus:ring-0"
            onClick={() => {
              FILTERS.panel = {};
              FILTERS.page = {};
              FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CLEAR });
              setFilteredAssets([...assets.slice(0, filteredAssets.length+BATCH_SIZE)]); }}
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
            id="page-search"
            name="page-search"
            placeholder="Search"
            aria-label="page-search"
            aria-describedby="page-search"
            classes="w-full"
            value={FILTERS.page && FILTERS.page.search ? FILTERS.page.search : ''}
            onChange={(e) => {FILTERS.page.search = e.target.value; searchFilterAssets(e.target.value);}}
          />
        </div>
        {/* sort dropdown */}
        <div className='flex flex-nowrap flex-1 gap-2 justify-start items-top w-full max-w-md'>
          <DropDown
            title='Sort By' items={getSortDropdownItemsList()} getItem={getSortDropdownItems} showSelectedItem={(FILTERS.page && FILTERS.page.sort)}
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
              className='w-full grow xxsm:w-40 xsm:w-44 xxsm:max-w-[15rem] border rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 cursor-pointer'
              ref={index === filteredAssets.length - 1 ? observe : null}
              onClick={() => ROUTER.push(`/asset/${asset.contractAddress}/${asset.tokenId}`)}
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
                    <div className="flex-1">Collection</div>
                    <div className="truncate">
                      {asset.collectionName && (<LinkWrapper link={`/collection/${asset.collectionId}`} linkText={asset.collectionName} />)}
                    </div>
                  </div>
                  <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                    <div className="flex-1">Price</div>
                    <div className="flex flex-row flex-nowrap justify-center items-center">
                    <div className="relative h-5 w-5">{ENUM.CHAIN_ICONS.ethereum}</div>
                      <div className="truncate">{asset.price}</div>
                    </div>
                  </div>
                  <div className="flex flex-nowrap flex-row gap-2 text-left hover:bg-gray-50">
                    <div className="flex-1">Owner</div>
                    <div className="truncate">
                      {asset.ownerName && (<LinkWrapper link={`/profile/${asset.owner}`} linkText={asset.ownerName} />)}
                      {!asset.ownerName && (<LinkWrapper link={`/profile/${asset.owner}`} linkText={asset.owner} />)}
                    </div>
                  </div>
                </>)}
              />
            </div>
          )
        })}
      </div>

    </>
  )
}
