import { useEffect, useState } from 'react';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '../../../Api';
import ButtonWrapper from '../../../wrappers/ButtonWrapper';
import InputWrapper from '../../../wrappers/InputWrapper';

export default function ActiveInactive({ initialData, title, isSearch = true, classes, api, action }) {
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
      return api(apiSortKey.id, 20);
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
      const newAssets = assets.filter((asset) => 
        asset.name.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0 ||
        asset.owner.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0 ||
        asset.id.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0 ||
        asset.contractAddress.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0 ||
        asset.category.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0 ||
        asset.image.toString().toLowerCase().indexOf(_value.toString().toLowerCase()) >= 0
      );
      setFilteredAssets(newAssets);
    } else {
      setFilteredAssets(assets);
    }
  };

  const removeAsset = (asset) => {
    const id = asset.id;
    const newAssets = assets.filter((asset) => asset.id.toString().toLowerCase().indexOf(id.toString().toLowerCase()) < 0);
    setAssets(newAssets);
    const newFilteredAssets = assets.filter((asset) => asset.id.toString().toLowerCase().indexOf(id.toString().toLowerCase()) < 0);
    setFilteredAssets(newFilteredAssets);
  };


  return (
    <>
{/* <p onClick={() => {console.log('exclusiveStartKey', exclusiveStartKey)}}>See exclusiveStartKey</p>
<p onClick={() => {console.log('apiSortKey', apiSortKey)}}>See apiSortKey</p>
<p onClick={() => {console.log('assets', assets)}}>See assets</p> */}

        {title && <div className='py-2 px-4 text-left font-bold'>{title}</div>}

        {isSearch && (
          <div className='px-2 flex flex-nowrap justify-start items-center'>
            <InputWrapper
              type="search"
              id="created-search"
              name="created-search"
              placeholder="Search name, owner, id, contract address, category, or image cid"
              aria-label="created-search"
              aria-describedby="created-search"
              classes="w-full"
              onChange={(e) => {setSearch(e.target.value); updateFilteredAssets(e.target.value); }}
            />
          </div>
        )}

        {filteredAssets && filteredAssets.length > 0 && (
          <div className={`flex flex-col overflow-x-scroll overflow-y-scroll h-96 ${classes}`}>
            <div className='w-max'>
              <div className='grid grid-cols-11'>
                <div className="bg-blue-100 border text-left px-1 py-1 sm:sticky sm:left-0">ID</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Name</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Owner</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Contract Address</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Total Supply</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Reflection</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Commission</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Owner Incentive Access</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Category</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Image</div>
                <div className="bg-blue-100 border text-left px-1 py-1">Action</div>
              </div>
              {filteredAssets.map((asset, index) => {
                return (
                  <div key={index} ref={index === filteredAssets.length - 1 ? observe : null} className='grid grid-cols-11 odd:bg-zinc-100'>
                    <div className="bg-blue-50 border px-1 py-1 sm:sticky sm:left-0">{asset.id}</div>
                    <div className="border px-1 py-1">{asset.name}</div>
                    <div className="border px-1 py-1">{asset.owner}</div>
                    <div className="border px-1 py-1">{asset.contractAddress}</div>
                    <div className="border px-1 py-1">{asset.totalSupply}</div>
                    <div className="border px-1 py-1">{asset.reflection}</div>
                    <div className="border px-1 py-1">{asset.commission}</div>
                    <div className="border px-1 py-1">{asset.ownerIncentiveAccess.toString()}</div>
                    <div className="border px-1 py-1">{asset.category}</div>
                    <div className="border px-1 py-1">{asset.image}</div>
                    <div className="border px-1 py-1">
                      {asset.active > 0 ?
                        <ButtonWrapper classes='px-1 py-1' onClick={() => {action(asset); removeAsset(asset);}}>Deactivate</ButtonWrapper>
                        :
                        <ButtonWrapper classes='px-1 py-1' onClick={() => {action(asset); removeAsset(asset);}}>Activate</ButtonWrapper>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

    </>
  )
}

