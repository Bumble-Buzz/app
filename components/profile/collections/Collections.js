import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import CollectionCard from '@/components/nftAssets/CollectionCard';
import API from '@/components/Api';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import { ArrowRightIcon } from '@heroicons/react/solid';


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


export default function Collections({ initialData }) {
  const ROUTER = useRouter();
  const WalletContext = useWallet();
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
      return API.swr.collection.owned(ROUTER.query.wallet, apiSortKey.id, BATCH_SIZE);
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
        const nextAssets = await API.collection.owned(ROUTER.query.wallet, latestSortKey.id, BATCH_SIZE);
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

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === WalletContext.state.account &&
      WalletContext.state.isNetworkValid
    )
  };
  const isProfileOwner = () => {
    return (session.user.id === ROUTER.query.wallet)
  };


  return (
    <>
{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
<p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p>
<p onClick={() => {console.log('assets', assets)}}>See assets</p> */}

      {isSignInValid() && isProfileOwner() && (
        <div className='py-2 flex flex-nowrap gap-2 justify-start items-center'>
          <ButtonWrapper
            classes="py-2 px-4 border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
            onClick={() => ROUTER.push('/collection/create/verified')}
          >
            Create new collection
            <ArrowRightIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
          </ButtonWrapper>
        </div>
      )}

      {/* search bar */}
      <div className="py-2 flex flex-nowrap gap-2 justify-start items-center w-full">
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
      <div className='py-2 flex flex-wrap gap-x-20 gap-y-4 justify-center items-center w-full'>
        {filteredAssets.map((collection, index) => {
          return (
            <CollectionCard
              key={index}
              innerRef={index === filteredAssets.length - 1 ? observe : null}
              link={`/collection/${collection.id}`}
              image={collection.image}
              body={(<>
                <div className="flex flex-nowrap flex-col gap-2">
                  <div className="grow w-full font-bold truncate">{collection.name}</div>
                  <div className="grow w-full -mt-2 truncate">
                    <>created by </>
                    {collection.ownerName && (<LinkWrapper link={`/profile/${collection.owner}`} linkText={collection.ownerName} />)}
                    {!collection.ownerName && (<LinkWrapper link={`/profile/${collection.owner}`} linkText={collection.owner} />)}
                  </div>
                  <div className="grow w-full line-clamp-3">{collection.description}</div>
                </div>
              </>)}
            />
          )
        })}
      </div>

    </>
  )
}
