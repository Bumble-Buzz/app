import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import ButtonWrapper from '../wrappers/ButtonWrapper';
import InputWrapper from '../wrappers/InputWrapper';
import { FilterPanel, FILTER_TYPES } from '../FilterPanel';
import Toast from '../Toast';
import { CATEGORIES } from '../../enum/Categories';
import WalletUtil from '../wallet/WalletUtil';
import NftCard from '../nftAssets/NftCard';
import API from '../Api';
import useSWR from 'swr';
import IPFS from '../../utils/ipfs';
import { BadgeCheckIcon, XIcon } from '@heroicons/react/solid';

import AvaxTradeNftAbi from '../../artifacts/contracts/AvaxTradeNft.sol/AvaxTradeNft.json';


export default function General() {
  return (
    <>
      <div className="">
        General dashboard info. Place where users can redeem funds/rewards.
      </div>
    </>
  )
}
