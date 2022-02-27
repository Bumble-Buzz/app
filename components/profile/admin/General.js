import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import WalletUtil from '../../wallet/WalletUtil';
import Toast from '../../Toast';

import AvaxTradeAbi from '../../../artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';

export default function General() {

  const getContracts = async () => {
    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);
    try {
      const val = await contract.getContracts();
      console.log('val', val);
    } catch (e) {
      Toast.error(e.message);
    }
  };

  const setContracts = async () => {
    const signer = await WalletUtil.getWalletSigner();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);
    try {
      const val = await contract.setContracts(
        process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS,
        process.env.NEXT_PUBLIC_SALE_CONTRACT_ADDRESS,
        process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS
      );
      console.log('val', val);
    } catch (e) {
      Toast.error(e.message);
    }
  };

  return (
    <>
      <div className="">
        admin General page
        <br />
        <p onClick={getContracts}>getContracts</p>
        <p onClick={setContracts}>setContracts</p>
      </div>
    </>
  )
}

