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
import { BadgeCheckIcon, XIcon } from '@heroicons/react/solid';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';

import AvaxTradeNftAbi from '../../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function Listings({ initialData }) {
  const ROUTER = useRouter();

  const [allAssets, setAllAssets] = useState([]);
  const [assets, setAssets] = useState([]);
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
  const { data, size, setSize } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      return API.swr.contracts(20, apiSortKey.uid, apiSortKey.chain);
    },
    API.swr.fetcher,
    {
      onSuccess: (_data) => {
        const lastEle = _data[_data.length - 1];
        setAssets([...assets, ...lastEle.Items]);
        setAllAssets([...allAssets, ...lastEle.Items]);
        setExclusiveStartKey(lastEle.LastEvaluatedKey);
      },
      ...API.swr.options
    }
  );

  useEffect(() => {
    if (initialData) {
      setAssets(initialData.Items);
      setAllAssets(initialData.Items);
      setExclusiveStartKey(initialData.LastEvaluatedKey);
    }
  }, [initialData]);

  // useEffect(() => {
  //   // console.log('assets', assets);
  //   // console.log('filteredAssets', filteredAssets);
  //   const newAssets = allAssets.filter((asset) => asset.contractAddress.toLowerCase().indexOf(search.toLowerCase()) >= 0);
  //   setAssets(newAssets);
  // }, [search]);

  const updateFilteredAssets = (_value) => {
    if (_value && _value !== '') {
      const newAssets = allAssets.filter((asset) => asset.contractAddress.toLowerCase().indexOf(_value.toLowerCase()) >= 0);
      setAssets(newAssets);
    } else {
      setAllAssets(allAssets);
    }
  };


  return (
    <>
      <div className="p-1 rounded-lg shadow-lg bg-white grow">

        <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
        <p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p>
        <p onClick={() => {console.log('assets', assets)}}>See assets</p>

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

        <div className='flex flex-wrap flex-col gap-2 justify-center items-center'>
          {assets.map((asset, index) => (
            <div key={index} ref={index === assets.length - 1 ? observe : null}>
              {asset.contractAddress && (asset.contractAddress) }
            </div>
          ))}
        </div>

      </div>
    </>
  )
}
