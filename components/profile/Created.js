import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import NftCard from '@/components/nftAssets/NftCard';
import API from '@/components/Api';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import { ShieldCheckIcon, ShieldExclamationIcon, ArrowRightIcon } from '@heroicons/react/solid';


export default function Created({ initialData }) {
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
      return API.swr.asset.created(ROUTER.query.wallet, apiSortKey.tokenId, 20);
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

  // useEffect(() => {
  //   // console.log('assets', assets);
  //   // console.log('filteredAssets', filteredAssets);
  //   const newAssets = assets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(search.toString().toLowerCase()) >= 0);
  //   setFilteredAssets(newAssets);
  // }, [search]);

  const updateFilteredAssets = async (_value) => {
    if (!_value || _value === '') return setFilteredAssets(assets);

    let newAssets = assets;
    let filteredAssets = [];
    let latestSortKey = exclusiveStartKey;
    while (filteredAssets.length === 0) {
      filteredAssets = newAssets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);

      if (filteredAssets.length > 0) break;
      if (!latestSortKey) break;

      // fetch next batch from db
      const nextAssets = await API.asset.created(ROUTER.query.wallet, latestSortKey.tokenId, 20);

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
            onClick={() => ROUTER.push('/asset/create')}
          >
            Create new NFT
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

        <div className='py-2 flex flex-wrap gap-4 justify-center items-center'>
          {filteredAssets.map((asset, index) => {
            return (
              <div
                key={index}
                className='w-full grow w-36 xsm:w-40 sm:w-60 max-w-xs border rounded-lg overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 cursor-pointer'
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
              </div>
            )
          })}
        </div>

    </>
  )
}
