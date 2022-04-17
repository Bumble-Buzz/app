import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import API from '@/components/Api';
import WalletUtil from '@/components/wallet/WalletUtil';
import CollectionIncentive from '@/components/profile/general/collection/CollectionIncentive';
import CollectionReflectionClaim from '@/components/profile/general/collection/CollectionReflectionClaim';
import Toast from '@/components/Toast';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';

import BankAbi from '@/artifacts/contracts/bank/Bank.sol/Bank.json';
import IERC721Abi from '@/artifacts/@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json';


const BATCH_SIZE = 20;

export default function CollectionAccount({ collection }) {
  const { data: session, status: sessionStatus } = useSession();
  const {data: ownedAssets} = useSWR(API.swr.asset.owned(session.user.id, collection.contractAddress, 'null', BATCH_SIZE), API.swr.fetcher, API.swr.options);
  
  const [reflection, setReflection] = useState(0);
  const [incentive, setIncentive] = useState(0);
  const [isLoading, setLoading] = useState(null);
  const [ownedTokenIds, setOwnedTokenIds] = useState([]);

  useEffect(async () => {
    if (collection) {
      try {
        const signer = await WalletUtil.getWalletSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);
  
        // fetch monetary information
        const collectionAccount = await contract.getCollectionAccount(collection.contractAddress);

        const incentiveInt = Number(collectionAccount.incentiveVault);
        const incentiveBalance = Number(ethers.utils.formatEther(incentiveInt.toString()));
        setIncentive(incentiveBalance);
  
        // const contract2 = new ethers.Contract("0xBDDf875B6f5Aa1C64aEA75c3bDf19b2b46215E29", IERC721Abi.abi, signer);
        // const ownerOf = await contract2.ownerOf(1);
        // console.log('ownerOf', ownerOf);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
      }
    };
  }, [collection]);

  useEffect(async () => {
    if (ownedAssets && ownedAssets.Items.length > 0) {
      try {
        const signer = await WalletUtil.getWalletSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);
  
        const collectionReflection = await contract.getReflectionVaultCollectionAccount(collection.contractAddress);
        let totalReflection = 0;
        let myTokenIds = []
        ownedAssets.Items.forEach((asset) => {
          const reflectionId = asset.tokenId-1;
          const reflectionInt = Number(collectionReflection[reflectionId]);
          const reflectionClaim = Number(ethers.utils.formatEther(reflectionInt.toString()));
          totalReflection += reflectionClaim;
          myTokenIds.push(asset.tokenId);
        });
        setOwnedTokenIds([...myTokenIds]);
        setReflection(totalReflection);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
      }
    };
  }, [ownedAssets]);


  return (
    <>
      <div className="py-4 px-4 shadow rounded-md border w-full max-w-xl">
        <div className="flex flex-col items-center divide-y w-full">

          <div className='py-1 flex flex-row flex-wrap justify-center items-center gap-x-2 w-full'>
            <div className='flex-1'>{collection.name}</div>
          </div>
          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Reflection</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(reflection, 'decimal', { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <div className='flex-1'>
              <CollectionReflectionClaim
                isLoading={isLoading} setLoading={setLoading}
                account={reflection} setAccount={setReflection}
                contractAddress={collection.contractAddress} ownedTokenIds={ownedTokenIds}
              />
            </div>
          </div>
          <div className='py-1 flex flex-row flex-wrap justify-between items-center gap-x-2 w-full'>
            <div className='flex-1'>Incentive</div>
            <div className='flex-1'>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                <div className='truncate'>{NumberFormatter(incentive, 'decimal', { maximumFractionDigits: 6 })}</div>
              </div>
            </div>
            <div className='flex flex-1 flex-row gap-x-1 justify-center items-center'>
              <CollectionIncentive
                isLoading={isLoading} setLoading={setLoading}
                account={incentive} setAccount={setIncentive}
                // ownerIncentiveAccess={collection.ownerIncentiveAccess}
                ownerIncentiveAccess={true} // FIXME remove hard-coded true after testing is done
              />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
