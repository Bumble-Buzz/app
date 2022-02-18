import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import ButtonWrapper from '../wrappers/ButtonWrapper';
import InputWrapper from '../wrappers/InputWrapper';
import Toast from '../Toast';
import WalletUtil from '../wallet/WalletUtil';
import NftCard from '../nftAssets/NftCard';
import API from '../Api';
import IPFS from '../../utils/ipfs';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/solid';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';

import AvaxTradeNftAbi from '../../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


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
      return API.swr.assets.created(ROUTER.query.wallet, apiSortKey.tokenId, 20);
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

  const updateFilteredAssets = (_value) => {
    if (_value && _value !== '') {
      const newAssets = assets.filter((asset) => asset.config.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0);
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

        <div className='flex flex-wrap gap-2 justify-center items-center'>
          {filteredAssets.map((asset, index) => {
            return (
              <NftCard
                key={index}
                innerRef={index === filteredAssets.length - 1 ? observe : null}
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
            )
          })}
        </div>

      </div>
    </>
  )
}
