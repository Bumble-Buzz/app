import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InputWrapper from '../wrappers/InputWrapper';
import CollectionCard from '../nftAssets/CollectionCard';
import API from '../Api';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';


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
      <div className="p-1 rounded-lg shadow-lg bg-white grow">

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

        <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
        <p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p>
        <p onClick={() => {console.log('assets', assets)}}>See assets</p>

        <div className='flex flex-wrap gap-4 gap-x-20 justify-center items-center'>
          {filteredAssets.map((asset, index) => {
            return (
              <CollectionCard
                key={index}
                innerRef={index === filteredAssets.length - 1 ? observe : null}
                image={asset.image}
                body={(<>
                  <div className="flex flex-nowrap flex-col gap-2">
                    <div className="grow w-full truncate">{asset.name}</div>
                    <div className="grow w-full truncate">by alias name || wallet id</div>
                    <div className="grow w-full line-clamp-3">
                      Description asdkhsadakals dka dkahd kahsdkah sdasdssd  kasjd aks ashksh ada sdasdasd asdas kj sdkjh aj
                      asdjhag d asdg ajds asjdg ajdsg ajsd ajsdhg ajsdgh ajhsdg ajsdg jahsdg jasgd jasg djasgd jahsdg ajhsdg aj
                    </div>
                  </div>
                </>)}
              />
            )
          })}
        </div>

      </div>
    </>
  )
}
