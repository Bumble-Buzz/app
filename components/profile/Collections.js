import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ButtonWrapper from '../wrappers/ButtonWrapper';
import InputWrapper from '../wrappers/InputWrapper';
import CollectionCard from '../nftAssets/CollectionCard';
import API from '../Api';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import { ArrowRightIcon } from '@heroicons/react/solid';


export default function Collections({ initialData }) {
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

  const updateFilteredAssets = (_value) => {
    if (_value && _value !== '') {
      const newAssets = assets.filter((asset) => asset.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);
      setFilteredAssets(newAssets);
    } else {
      setFilteredAssets(assets);
    }
  };


  return (
    <>
{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
<p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p>
<p onClick={() => {console.log('assets', assets)}}>See assets</p> */}

      <div className='py-2 flex flex-nowrap gap-2 justify-start items-center'>
        <ButtonWrapper
          classes="py-2 px-4 border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
          onClick={() => ROUTER.push('/collection/create/verified')}
        >
          Create new collection
          <ArrowRightIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
        </ButtonWrapper>
      </div>

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
              image={asset.image}
              body={(<>
                <div className="flex flex-nowrap flex-col gap-2">
                  {asset.collectionType === 'local' || asset.collectionType === 'unverified' ?
                    (<div className="grow w-full font-bold truncate">{asset.name} - {asset.collectionType}</div>)
                    :
                    (<div className="grow w-full font-bold truncate">{asset.name}</div>)
                  }
                  <div className="grow w-full -mt-2 truncate">
                    <p>
                      by <Link href={`/profile/${asset.owner}`} passHref={true}><a className='text-blue-500'>
                        {asset.ownerName &&  asset.ownerName }
                        {!asset.ownerName &&  asset.owner }
                      </a></Link>
                    </p>
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
