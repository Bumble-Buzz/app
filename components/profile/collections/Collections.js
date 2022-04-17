import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import CollectionCard from '@/components/nftAssets/CollectionCard';
import API from '@/components/Api';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import { ArrowRightIcon } from '@heroicons/react/solid';


export default function Collections({ initialData }) {
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const ROUTER = useRouter();

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
      return API.swr.collection.owned(ROUTER.query.wallet, apiSortKey.id, 20);
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
      filteredAssets = newAssets.filter((asset) => asset.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);

      if (filteredAssets.length > 0) break;
      if (!latestSortKey) break;

      // fetch next batch from db
      const nextAssets = await API.collection.owned(ROUTER.query.wallet, latestSortKey.id, 20);

      newAssets.push(...nextAssets.data.Items);
      latestSortKey = nextAssets.data.LastEvaluatedKey;
    }
    setAssets([...newAssets]);
    setFilteredAssets([...filteredAssets]);
    setExclusiveStartKey(latestSortKey);
  };

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      AuthContext.state.isNetworkValid
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

      <div className='py-2 flex flex-nowrap gap-2 justify-start items-center'>
        <InputWrapper
          type="search"
          id="created-search"
          name="created-search"
          placeholder="Search by name"
          aria-label="created-search"
          aria-describedby="created-search"
          classes="w-full"
          // value={search}
          onChange={(e) => {setSearch(e.target.value); updateFilteredAssets(e.target.value); }}
        />
      </div>

      <div className='py-2 flex flex-wrap gap-4 gap-x-20 justify-center items-center'>
        {filteredAssets.map((asset, index) => {
          return (
            <CollectionCard
              key={index}
              innerRef={index === filteredAssets.length - 1 ? observe : null}
              link={`/collection/${asset.id}`}
              image={asset.image}
              body={(<>
                <div className="flex flex-nowrap flex-col gap-2">
                  {asset.collectionType === 'local' || asset.collectionType === 'unverified' ?
                    (<div className="grow w-full font-bold truncate">{asset.name} - {asset.collectionType}</div>)
                    :
                    (<div className="grow w-full font-bold truncate">{asset.name}</div>)
                  }
                  <div className="grow w-full -mt-2 truncate">
                    <>created by </>
                    {asset.ownerName && (<LinkWrapper link={`/profile/${asset.owner}`} linkText={asset.ownerName} />)}
                    {!asset.ownerName && (<LinkWrapper link={`/profile/${asset.owner}`} linkText={asset.owner} />)}
                  </div>
                  <div className="grow w-full line-clamp-3">{asset.description}</div>
                </div>
              </>)}
            />
          )
        })}
      </div>

    </>
  )
}