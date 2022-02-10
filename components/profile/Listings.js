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

import useInView from "react-cool-inview";


import AvaxTradeNftAbi from '../../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function Listings() {
  const ROUTER = useRouter();

  const [allAssets, setAllAssets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);

  const { observe } = useInView({
    threshold: 0,
    onEnter: async ({ unobserve }) => {
      if (!search) {
        const lastEvaluatedKey = await contractsDb(true);
        if (!lastEvaluatedKey) {
          unobserve();
        }
      }
    },
  });

  useEffect(async () => {
    await getDbData();
  }, []);

  useEffect(() => {
    // console.log('assets', assets);
    // console.log('filteredAssets', filteredAssets);
    const newAssets = allAssets.filter((asset) => asset.contractAddress.toLowerCase().indexOf(search.toLowerCase()) >= 0);
    setAssets(newAssets);
  }, [search]);

  const updateFilteredAssets = (_value) => {
    if (_value && _value !== '') {
      const newAssets = allAssets.filter((asset) => asset.contractAddress.toLowerCase().indexOf(_value.toLowerCase()) >= 0);
      setAssets(newAssets);
    } else {
      setAllAssets(allAssets);
    }
  };

  const contractsDb = async (_lazyLoad) => {
    const payload = {
      TableName: "contracts",
      ExclusiveStartKey: exclusiveStartKey,
      Limit: 22
    };
    const results = await API.db.item.scan(payload);
    const {items, lastEvaluatedKey} = results.data;
    console.log('results', {items, lastEvaluatedKey});

    if (!_lazyLoad) {
      // if first time
      console.log('undefined');
      setAllAssets(items);
      setAssets(items);
    } else {
      console.log('defined');
      setAllAssets([...assets, ...items]);
      setAssets([...assets, ...items]);
    }
    setExclusiveStartKey(lastEvaluatedKey);
    return lastEvaluatedKey;
  };

  const getDbData = async () => {
    await contractsDb();
  };


  return (
    <>
      <div className="p-1 rounded-lg shadow-lg bg-white grow">

        <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
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
            onChange={(e) => {setSearch(e.target.value);  }}
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
