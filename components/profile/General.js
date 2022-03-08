import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import { FilterPanel, FILTER_TYPES } from '@/components/FilterPanel';
import Toast from '@/components/Toast';
import { CATEGORIES } from '@/enum/Categories';
import WalletUtil from '@/components/wallet/WalletUtil';
import NftCard from '@/components/nftAssets/NftCard';
import API from '@/components/Api';
import useSWR from 'swr';
import IPFS from '@/utils/ipfs';
import { BadgeCheckIcon, XIcon } from '@heroicons/react/solid';

import AvaxTradeNftAbi from '@/artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function General() {
  return (
    <>
      <div className="">
        General dashboard info. Place where users can redeem funds/rewards.
      </div>
    </>
  )
}
