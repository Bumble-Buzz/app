import { useEffect, useState, useReducer } from 'react';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import HeadlessSwitch from '@/components/HeadlessSwitch';
import Sort from '@/utils/Sort';
import { useFilter, FILTER_CONTEXT_ACTIONS } from '@/contexts/FilterContext';


const BATCH_SIZE = 40;

export const _arrAddRemove = ([..._data] = [], _element) => {
  if (!_element) return [..._data];

  const index = _data.indexOf(_element);
  const exists = (index >= 0);
  if (exists) {
    const length = _data.length;
    _data[index] = _data[length-1];
    _data.pop();
  } else {
    _data.push(_element);
  }
  return [..._data];
};


export default function ExploreCollectionsFilter({children, collectionInit}) {
  const FilterContext = useFilter();

  const [filteredAssets, setFilteredAssets] = useState([]);
  const [apiSortKey, setApiSortKey] = useState(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);
  const [userInputTimer, setUserInputTimer] = useState(null);

  const [search, setSearch] = useState('');

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
      return API.swr.collection.active(apiSortKey.id, BATCH_SIZE);
    },
    API.swr.fetcher,
    {
      onSuccess: (_data) => {
        const lastEle = _data[_data.length - 1];
        setFilteredAssets([...sortCollections([...filteredAssets, ...lastEle.Items])]);
        setExclusiveStartKey(lastEle.LastEvaluatedKey);

        const newState = [...FilterContext.state.collections.items, ...lastEle.Items];
        FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.COLLECTIONS, payload: { collections: newState, exclusiveStartKey: lastEle.LastEvaluatedKey } });
      },
      ...API.swr.options
    }
  );

  useEffect(() => {
    if (!FilterContext.state.collections.items && collectionInit) {
      setFilteredAssets([...sortCollections(collectionInit.Items)]);
      setExclusiveStartKey(collectionInit.LastEvaluatedKey);
      FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.COLLECTIONS, payload: { collections: [...collectionInit.Items], exclusiveStartKey: collectionInit.LastEvaluatedKey } });
    } else if (FilterContext.state.collections.items) {
      setFilteredAssets([...sortCollections(FilterContext.state.collections.items)]);
      setExclusiveStartKey(FilterContext.state.collections.exclusiveStartKey);
    }
  }, []);

  const sortCollections = (_data, _comparator = FilterContext.state.collections.selected) => {
    return Sort.sortBoolean(_data, _comparator);
  };

  const getCollectionsState = (collections) => {
    let state = [];
    if (collections && collections.length > 0) {
      state = JSON.parse(JSON.stringify(collections));
      // state.forEach((ele) => {
      //   ele.isSelected = false;
      // });
    }
    return state;
  };

  const searchFilterAssets = async (_value) => {
    if (!_value || _value === '') return setFilteredAssets([...sortCollections(FilterContext.state.collections.items)]);

    clearTimeout(userInputTimer);
    
    const newTimer = setTimeout(async () => {
      await filterAssets(false, (newAssets) => {
        return newAssets.filter((asset) => asset.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);
      });
    }, 500);

    setUserInputTimer(newTimer);
  };

  const filterAssets = async (useFilteredAssets = false, filter) => {
    return new Promise(async (resolve) => {
      let dbAssets = [];
      let workingAssets = JSON.parse(JSON.stringify(FilterContext.state.collections.items));
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
        const nextAssets = await API.collection.getActivate(latestSortKey.id, BATCH_SIZE);
        dbFetchCount++;

        workingAssets.push(...nextAssets.data.Items);
        dbAssets.push(...nextAssets.data.Items);
        latestSortKey = nextAssets.data.LastEvaluatedKey;
      }
      setFilteredAssets([...sortCollections(newFilteredAssets)]);
      setExclusiveStartKey(latestSortKey);

      const newState = [...FilterContext.state.collections.items, ...dbAssets];
      FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.COLLECTIONS, payload: { collections: newState } });

      resolve();
    });
  };

  return (
    <>
{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
<p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p>
<p onClick={() => {console.log('filteredAssets', filteredAssets); console.log('filteredAssets', filteredAssets.map((asset) => asset.id));}}>See filteredAssets</p>
<p onClick={() => {console.log('state', FilterContext.state.collections.items, FilterContext.state.collections.items.length)}}>See state</p> */}

      {/* search */}
      <div className='flex flex-col grow'>
        <InputWrapper
          type="search"
          id="collections-search"
          name="collections-search"
          placeholder="Search by name"
          aria-label="collections-search"
          aria-describedby="collections-search"
          classes="w-full sm:w-52"
          value={search}
          onChange={(e) => { setSearch(e.target.value ); searchFilterAssets(e.target.value); }}
        />
      </div>

      {/* collections */}
      <div className='flex flex-col overflow-y-auto max-h-52 gap-2 '>
        {filteredAssets && filteredAssets.map((collection, index) => {
          return (
            <div key={index} ref={index === filteredAssets.length - 1 ? observe : null} className='flex flex-col grow'>
              <HeadlessSwitch
                classes=""
                enabled={FilterContext.state.collections.selected.includes(collection.id)}
                onChange={() => {
                  const selectedCollections = _arrAddRemove([...FilterContext.state.collections.selected], collection.id);
                  setFilteredAssets([...sortCollections(filteredAssets, selectedCollections)]);
                  FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.COLLECTIONS_ITEMS, payload: { collection: collection.id } });
                }}
              >
                {collection.name}
              </HeadlessSwitch>
            </div>
          )
        })}
      </div>
    </>
  )
}
