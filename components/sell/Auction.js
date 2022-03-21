import { useEffect, useState, useReducer } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import WalletUtil from '@/components/wallet/WalletUtil';
import API from '@/components/Api';
import Toast from '@/components/Toast';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import AssetImage from '@/components/asset/AssetImage';
import Lexicon from '@/lexicon/create';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';
import NumberFormatter from '@/utils/NumberFormatter';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';
import IERC721Abi from '@/artifacts/@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';


const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case 'category':
      state.category = action.payload.category;
      return state
    case 'price':
      state.price = action.payload.price;
      return state
    case 'approved':
      newState = JSON.parse(JSON.stringify(state));
      newState.approved = action.payload.approved;
      return newState
    case 'approvedAll':
      newState = JSON.parse(JSON.stringify(state));
      newState.approvedAll = action.payload.approvedAll;
      return newState
    case 'clear':
      return {
        category: '',
        price: 0,
        approved: false,
        approvedAll: false
      }
    default:
      return state
  }
};

export default function Auction({children, assetDataInit, setSaleCreated}) {
  const ROUTER = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  let dbTriggered = false;
  const [isLoading, setLoading] = useState(false);
  const [blockchainResults, setBlockchainResults] = useState(null);

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        const payload = {
          'id': Number(blockchainResults.itemId),
          'contractAddress': ethers.utils.getAddress(blockchainResults.contractAddress),
          'tokenId': Number(blockchainResults.tokenId),
          'collectionId': Number(assetDataInit.collectionId),
          'seller': ethers.utils.getAddress(blockchainResults.seller),
          'buyer': ethers.utils.getAddress(EMPTY_ADDRESS),
          'price': Number(state.price),
          'saleType': Number(blockchainResults.saleType),
          'category': state.category
        };
        await API.sale.create(payload);

        setSaleCreated(true);
      } catch (e) {
        Toast.error(e.message);
        setLoading(false);
      }
    })();
  }, [blockchainResults]);

  useEffect(() => {
    isTokenApproved();
    isTokenApprovedAll();
  }, []);

  const initCategory = () => {
    let category = 'Art';
    if (
      Number(assetDataInit.collectionId) !== Number(process.env.NEXT_PUBLIC_UNVERIFIED_COLLECTION_ID) &&
      Number(assetDataInit.collectionId) !== Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID)) {
        category = assetDataInit.category;
    }
    return category;
  };
  const [state, dispatch] = useReducer(reducer, {
    category: initCategory(),
    price: 0,
    approved: false,
    approvedAll: false
  });

  const isTokenApproved = async () => {
    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(assetDataInit.contractAddress, IERC721Abi.abi, signer);
    let approvedAddress = await contract.getApproved(assetDataInit.tokenId);
    dispatch({ type: 'approved', payload: { approved: (approvedAddress === process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS) } });
  };
  const isTokenApprovedAll = async () => {
    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(assetDataInit.contractAddress, IERC721Abi.abi, signer);
    let isApproved = await contract.isApprovedForAll(session.user.id, process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS);
    dispatch({ type: 'approvedAll', payload: { approvedAll: isApproved } });
  };

  const actionButton = () => {
    if (isLoading) return (
      <ButtonWrapper disabled type="submit" classes="">
        <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />
        {Lexicon.form.submit.processing}
      </ButtonWrapper>
    )
    let actionButtonText = 'Sell';
    if (!state.approved) actionButtonText = 'Approve';
    return (<ButtonWrapper type="submit" classes="">{actionButtonText}</ButtonWrapper>)
  };

  const approveAsset = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(assetDataInit.contractAddress, IERC721Abi.abi, signer);
      const val = await contract.approve(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, assetDataInit.tokenId);
      // const val = await contract.setApprovalForAll(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, true);
      await WalletUtil.checkTransaction(val);

      const listener = async (owner, approved, tokenId) => {
        if (session.user.id === ethers.utils.getAddress(owner) && Number(assetDataInit.tokenId) === Number(tokenId) &&
          ethers.utils.getAddress(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS) === ethers.utils.getAddress(approved)
        ) {
          dispatch({ type: 'approved', payload: { approved: (approved === process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS) } });
          setLoading(false);
          contract.off("Approval", listener);
        }
      };
      contract.on("Approval", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  const sellAsset = async (e) => {
    e.preventDefault();

    // revoke - approve empty address
    // const signer = await WalletUtil.getWalletSigner();
    // const contract = new ethers.Contract(assetDataInit.contractAddress, IERC721Abi.abi, signer);
    // await contract.approve(EMPTY_ADDRESS, assetDataInit.tokenId);
    // return;

    if (state.price <= 0) {
      Toast.error('Sale price must be greated than zero');
      return;
    }

    try {
      setLoading(true);
      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // create market sale
      const val = await contract.createMarketSale(
        assetDataInit.tokenId, assetDataInit.contractAddress, EMPTY_ADDRESS, state.price, 1
      );
        
      await WalletUtil.checkTransaction(val);
      
      const listener = async (itemId, tokenId, contractAddress, seller, saleType) => {
        console.log('found create market sale event: ', Number(itemId), Number(tokenId), contractAddress, seller, Number(saleType));
        if (!dbTriggered && session.user.id === seller && Number(assetDataInit.tokenId) === Number(tokenId) &&
          ethers.utils.getAddress(assetDataInit.contractAddress) === ethers.utils.getAddress(contractAddress)
        ) {
          dbTriggered = true;
          setBlockchainResults({ itemId, tokenId, contractAddress, seller, saleType });
          contract.off("onCreateMarketSale", listener);
        }
      };
      contract.on("onCreateMarketSale", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        if (!state.approved) {
          approveAsset(e);
        } else {
          sellAsset(e);
        }
      }}
      method="POST"
      className="w-full sm:w-auto"
    >
      {/* <p onClick={() => console.log(state)}>see state</p> */}
      <div className="shadow rounded-md">

        <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">

          {/* image */}
          <div className='flex flex-col border rounded-lg overflow-hidden w-full max-w-sm'>
            <AssetImage image={assetDataInit.config.image} />
          </div>

          {/* description */}
          <div className="my-2 flex flex-col gap-2 w-full max-w-xl">
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
              <div className='flex-1'>Name:</div>
              <div className='truncate'>{assetDataInit.config.name}</div>
            </div>
            {assetDataInit.commission && (
              <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                <div className='flex-1'>Commission:</div>
                <div className='truncate'>{NumberFormatter(assetDataInit.commission/100,'percent')}</div>
              </div>
            )}
            {Number(assetDataInit.collectionId) !== Number(process.env.NEXT_PUBLIC_UNVERIFIED_COLLECTION_ID) &&
              Number(assetDataInit.collectionId) !== Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID) &&
            (
              <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                <div className='flex-1'>Category:</div>
                <div className='truncate'>{assetDataInit.category}</div>
              </div>
            )}
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2'>
              <div className='flex-1'>Contract Address:</div>
              <div className='text-blue-500 hover:text-blue-600 truncate'>
                <a href="https://google.ca/" target='blank'>{assetDataInit.contractAddress}</a>
              </div>
            </div>
          </div>

          {/* category */}
          {Number(assetDataInit.collectionId) === Number(process.env.NEXT_PUBLIC_UNVERIFIED_COLLECTION_ID) ||
            Number(assetDataInit.collectionId) === Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID) &&
          (
            <div className="my-2 flex flex-col gap-2 w-full max-w-xl">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">{Lexicon.form.category.text}</label>
              <select
                id="category"
                name="category"
                autoComplete="category-name"
                required
                className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                onChange={(e) => dispatch({ type: 'category', payload: { category: e.target.value } })}
              >
                <option>{Lexicon.form.category.art}</option>
                <option>{Lexicon.form.category.games}</option>
                <option>{Lexicon.form.category.meme}</option>
                <option>{Lexicon.form.category.photography}</option>
                <option>{Lexicon.form.category.sports}</option>
                <option>{Lexicon.form.category.nsfw}</option>
                <option>{Lexicon.form.category.other}</option>
              </select>
            </div>
          )}

          {/* sale price */}
          <div className="my-2 flex flex-col gap-2 w-full max-w-xl">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Sale Price</label>
            <div className='flex flex-row flex-nowrap justify-start items-center relative'>
              <div className='absolute'>
                <div className="relative h-5 w-5">
                  <Image src={'/chains/ethereum-color.svg'} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />
                </div>
              </div>
              <input
                type="number"
                min="0"
                name="price"
                id="price"
                defaultValue={state.price}
                required
                className="pl-5 mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
                onChange={(e) => dispatch({ type: 'price', payload: { price: Number(e.target.value) } })}
              />
            </div>
          </div>

        </div>

        <div className="flex flex-row items-center justify-between gap-2 px-4 py-4 bg-gray-50 text-right">
          <ButtonWrapper classes="" onClick={() => ROUTER.back()}>Back</ButtonWrapper>
          {actionButton()}
        </div>

      </div>
    </form>
  )
}
