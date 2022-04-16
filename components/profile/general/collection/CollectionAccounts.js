import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import API from '@/components/Api';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import CollectionAccount from '@/components/profile/general/collection/CollectionAccount';
import InputWrapper from '@/components/wrappers/InputWrapper';


const BATCH_SIZE = 40;
const FILTERS = {
  page: {}
};

const _doesArrayInclude = (_array, _identifier = {}) => {
  const match = _array.find((arrayElement) => {
      return _.isEqual(arrayElement, _identifier);
  });
  return match == undefined ? false : true;
};


export default function CollectionAccounts({ collectionData }) {
  const { data: session, status: sessionStatus } = useSession();

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
      return API.swr.collection.owned(session.user.id, apiSortKey.id, BATCH_SIZE);
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
    if (collectionData) {
      setAssets(collectionData.Items);
      setFilteredAssets(collectionData.Items);
      setExclusiveStartKey(collectionData.LastEvaluatedKey);
    }
  }, [collectionData]);

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
    if (!_value || _value === '') return setFilteredAssets(assets.slice(0, BATCH_SIZE));

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
        const nextAssets = await API.collection.owned(session.user.id, latestSortKey.id, BATCH_SIZE);
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
    // search
    if (FILTERS.page.search && FILTERS.page.search !== '') {
      workingAssets = workingAssets.filter((asset) => asset.name.toString().toLowerCase().indexOf(FILTERS.page.search.toString().toLowerCase()) >= 0);
    }

    // // sort
    // if (FILTERS.page.sort) {
    //   workingAssets = FILTERS.page.sort(workingAssets);
    // }

    // return filterd assets
    return [...workingAssets];
  };


  return (
    <>
      {/* search bar */}
      <div className="py-2 flex flex-nowrap gap-2 justify-start items-center w-full max-w-xl">
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
      {/* content */}
      <div className='py-2 flex flex-wrap gap-4 justify-center items-center w-full max-w-xl'>
        {filteredAssets.map((collection, index) => {
          return (
            <div
              key={index}
              ref={index === filteredAssets.length - 1 ? observe : null}
              className="w-full max-w-xl"
            >
              <CollectionAccount collection={collection} />
            </div>
          )
        })}
      </div>
    </>
  )
}
