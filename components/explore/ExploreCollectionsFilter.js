import { useEffect, useState, useReducer } from 'react';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import HeadlessSwitch from '@/components/HeadlessSwitch';


const BATCH_SIZE = 40;


export default function ExploreCollectionsFilter({children, collectionInit, getCollections}) {

  const [assets, setAssets] = useState([]);
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
        setAssets([...assets, ...lastEle.Items]);
        setFilteredAssets([...filteredAssets, ...lastEle.Items]);
        setExclusiveStartKey(lastEle.LastEvaluatedKey);
        dispatch({ type: 'add', payload: getCollectionsState([...lastEle.Items]) });
      },
      ...API.swr.options
    }
  );

  useEffect(() => {
    if (collectionInit) {
      setAssets(collectionInit.Items);
      setFilteredAssets(collectionInit.Items);
      setExclusiveStartKey(collectionInit.LastEvaluatedKey);
      // getCollections(getCollectionsState(collectionInit.Items));
    }
  }, [collectionInit]);

  const getCollectionsState = (collections) => {
    let state = {};
    if (collections && collections.length > 0) {
      collections.forEach((collection) => {
        state[collection.id] = false;
      });
    }
    return state;
  };
  // console.log('getCollectionsState', getCollectionsState());

  const reducer = (state, action) => {
    let newState;
    if (action.type !== 'add' && action.type !== 'clear' && action.type !== 'update') {
      newState = JSON.parse(JSON.stringify(state));
      newState[action.type] = !state[action.type];
      getCollections(newState);
      return newState
    } else {
      switch(action.type) {
        case 'add':
          newState = { ...state, ...action.payload };
          getCollections(newState);
          return newState
        case 'clear':
          newState = JSON.parse(JSON.stringify(state));
          newState = getCollectionsState([...assets]);
          getCollections(newState);
          return newState
        case 'update':
          newState = JSON.parse(JSON.stringify(state));
          getCollections(newState);
          return newState
        default:
          getCollections(state);
          return state
      }
    }
  };
  const [state, dispatch] = useReducer(reducer, getCollectionsState([...collectionInit.Items]));

  const searchFilterAssets = async (_value) => {
    if (!_value || _value === '') return setFilteredAssets(assets);

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
        const nextAssets = await API.collection.getActivate(latestSortKey.id, BATCH_SIZE);
        dbFetchCount++;

        workingAssets.push(...nextAssets.data.Items);
        dbAssets.push(...nextAssets.data.Items);
        latestSortKey = nextAssets.data.LastEvaluatedKey;
      }
      setAssets([...assets, ...dbAssets]);
      setFilteredAssets([...newFilteredAssets]);
      setExclusiveStartKey(latestSortKey);

      resolve();
    });
  };

  return (
    <>
{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p> */}
{/* <p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p> */}
<p onClick={() => {console.log('assets', assets)}}>See assets</p>
<p onClick={() => {console.log('filteredAssets', filteredAssets); console.log('filteredAssets', filteredAssets.map((asset) => asset.id));}}>See filteredAssets</p>
<p onClick={() => {console.log('state', state, Object.getOwnPropertyNames(state).length)}}>See state</p>

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
        {filteredAssets.map((asset, index) => {
          return (
            <div key={index} ref={index === filteredAssets.length - 1 ? observe : null} className='flex flex-col grow'>
              <HeadlessSwitch
                classes=""
                enabled={state[asset.id]}
                onChange={() => dispatch({ type: asset.id }) }
              >
                {asset.name}
              </HeadlessSwitch>
            </div>
          )
        })}
      </div>
    </>
  )
}
