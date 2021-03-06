import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import API from '@/components/Api';
import Toast from '@/components/Toast';
import WalletUtil from '@/components/wallet/WalletUtil';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import CheckEnvironment from '@/components/CheckEnvironment';

import CollectionItemAbi from '@bumblebuzz/contracts/artifacts/contracts/collectionItem/CollectionItem.sol/CollectionItem.json';


export default function ActiveInactive({ initialData, title, isSearch = true, classes, api }) {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [apiSortKey, setApiSortKey] = useState(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(null);
  let dbTriggered = false;
  const [blockchainResults, setBlockchainResults] = useState(null);
  const [blockchainRemove, setBlockchainRemove] = useState(null);

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

  const removeAsset = (id) => {
    const newAssets = assets.filter((asset) => asset.id.toString().toLowerCase().indexOf(id.toString().toLowerCase()) < 0);
    setAssets(newAssets);
    const newFilteredAssets = assets.filter((asset) => asset.id.toString().toLowerCase().indexOf(id.toString().toLowerCase()) < 0);
    setFilteredAssets(newFilteredAssets);
  };

  // deactivate collection in blockchain
  const deactivate = async (_asset, _contract) => {
    const val = await _contract.deactivateCollection(_asset.id);

    await WalletUtil.checkTransaction(val);

    const listener = async (id, active) => {
      if (!dbTriggered && _asset.id === Number(id) && !active) {
        dbTriggered = true;
        setBlockchainResults({ asset: _asset });
        _contract.off("onActivation", listener);
      }
    };
    _contract.on("onActivation", listener);
  };

  // activate collection in blockchain
  const activate = async (_asset, _contract) => {
    const val = await _contract.activateCollection(_asset.id);

    await WalletUtil.checkTransaction(val);

    const listener = async (id, active) => {
      if (!dbTriggered && _asset.id === Number(id) && active) {
        dbTriggered = true;
        setBlockchainResults({ asset: _asset });
        _contract.off("onActivation", listener);
      }
    };
    _contract.on("onActivation", listener);
  };

  const action = async (_asset, _activate) => {
    /** @todo Remove once product released **/
    if (CheckEnvironment.isDevProdMode) { Toast.info(process.env.NEXT_PUBLIC_FEATURE_UNDER_DEVELOPMENT); return; }

    try {
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS, CollectionItemAbi.abi, signer);

      if (_activate) {
        activate(_asset, contract);
      } else {
        deactivate(_asset, contract);
      }
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        const asset = blockchainResults.asset;
        const payload = { 'id': Number(asset.id) };
        if (asset.active > 0) {
          await API.collection.active.deactivate(payload);
        } else {
          await API.collection.active.activate(payload);
        }
        removeAsset(Number(asset.id));

        setBlockchainResults(null);
        dbTriggered = false;
      } catch (e) {
        Toast.error(e.message);
      }
    })();
  }, [blockchainResults]);

  // remove collection in blockchain
  const remove = async (_asset) => {
    /** @todo Remove once product released **/
    if (CheckEnvironment.isDevProdMode) { Toast.info(process.env.NEXT_PUBLIC_FEATURE_UNDER_DEVELOPMENT); return; }

    try {
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS, CollectionItemAbi.abi, signer);

      
      const listener = async (id) => {
        if (!dbTriggered && _asset.id === Number(id)) {
          dbTriggered = true;
          setBlockchainRemove({ asset: _asset });
          contract.off("onCollectionRemove", listener);
        }
      };
      contract.on("onCollectionRemove", listener);

      const transaction = await contract.removeCollection(_asset.id);
      await transaction.wait();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (!blockchainRemove || dbTriggered) return;

      try {
        const asset = blockchainRemove.asset;
        const payload = { 'id': Number(asset.id) };
        await API.collection.remove(payload);
        removeAsset(Number(asset.id));

        setBlockchainRemove(null);
        dbTriggered = false;
      } catch (e) {
        Toast.error(e.message);
      }
    })();
  }, [blockchainRemove]);


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
              <div className='grid grid-cols-12'>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center sm:sticky sm:left-0">ID</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Name</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Owner</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Contract Address</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Total Supply</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Reflection</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Commission</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Owner Incentive Access</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Category</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Image</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Collection Type</div>
                <div className="bg-blue-100 border text-left px-1 py-1 text-center">Action</div>
              </div>
              {filteredAssets.map((asset, index) => {
                return (
                  <div key={index} ref={index === filteredAssets.length - 1 ? observe : null} className='grid grid-cols-12 odd:bg-zinc-100'>
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
                    <div className="border px-1 py-1">{asset.collectionType}</div>
                    <div className="border px-1 py-1 flex justify-center gap-1">
                      {asset.active > 0 ?
                        <ButtonWrapper classes='px-1 py-1' onClick={async () => await action(asset,false)}>Deactivate</ButtonWrapper>
                        :
                        <ButtonWrapper classes='px-1 py-1' onClick={async () => await action(asset,true)}>Activate</ButtonWrapper>
                      }
                      <ButtonWrapper classes='px-1 py-1' onClick={async () => await remove(asset)}>Remove</ButtonWrapper>
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

