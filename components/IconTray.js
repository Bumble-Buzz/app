import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';
import WalletUtil from '@/components/wallet/WalletUtil';
import DropDown from '@/components/navbar/DropDown';
import Tooltip from '@/components/Tooltip';
import HeadlessDialog from '@/components/HeadlessDialog';
import IncentiveDeposit from '@/components/profile/general/collection/IncentiveDeposit';
import Discord from '@/public/socials/discord-solid.svg';
import Twitter from '@/public/socials/twitter-solid.svg';
import Website from '@/public/socials/website-solid.svg';
import Menu from '@/public/menu.svg';
import Toast from '@/components/Toast';
import { MenuIcon, RefreshIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


const DIALOG = { title: '', content: () => {} };

export default function IconTray({ items, specialItems, options }) {
  const WalletContext = useWallet();

  const [actionDialog, setActionDialog] = useState(false);

  const depositAction = async (e, _depositAmount) => {
    e.preventDefault();

    try {
      setActionDialog(false);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      
      const listener = async (user, _contractAddress, _amount) => {
        const amountInt = Number(_amount);
        const amount = Number(ethers.utils.formatEther(amountInt.toString()));
        console.log('found deposit incentive event: ', user, _contractAddress, Number(_amount));
        if (WalletContext.state.account === user && options.contractAddress === _contractAddress) {
          Toast.success(`Incentive deposited: ${amount} ETH`);
          options.incrementIncentiveAmount(amount);
          contract.off("onDepositCollectionIncentive", listener);
        }
      };
      contract.on("onDepositCollectionIncentive", listener);

      // deposit incentives
      const transaction = await contract.depositIncentiveCollectionAccount(options.contractAddress, { value: ethers.utils.parseEther(_depositAmount.toString()) });
      await transaction.wait();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
    }
  };
  const deposit = async () => {
    DIALOG.title = 'Deposit to incentive pool';
    DIALOG.content = () => (<IncentiveDeposit action={depositAction} />);
    setActionDialog(true);
  };

  const getItem = (itemId) => {
    switch(itemId) {
      case 1:
        return {
          label: 'Refresh metadata',
          link: '/',
          icon: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 2:
        return {
          label: 'Report',
          link: '/',
          icon: (<MenuIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<MenuIcon className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 'Donate':
        return {
          label: 'Donate',
          action: () => deposit(),
          icon: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 'Edit':
        return {
          label: 'Edit',
          link: `/collection/update/${options.id}`,
          icon: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      default:
        return {};
    };
  };

  return (
    <>
      <HeadlessDialog open={actionDialog} setOpen={setActionDialog} title={DIALOG.title} content={DIALOG.content()} />
      <div className='grid grid-rows-1 grid-flow-col w-fit divide-x border rounded-lg shadow-lg bg-gray-50 items-center text-center'>
        {items && items.filter((item) => item.link).map((item, index) => {
          return (
            <a href="https://google.ca/" target='blank' key={index}>
              <Tooltip text={`${item.hover}`}>
                <div className='mx-2 my-2 transform transition duration-500 hover:scale-105 cursor-pointer'>
                  {item.name === 'discord' && <Discord height={24} width={24} />}
                  {item.name === 'twitter' && <Twitter height={24} width={24} />}
                  {item.name === 'website' && <Website height={24} width={24} />}
                </div>
              </Tooltip>
            </a>
          )
        })}
        <div className='w-fit'>
          <div className='mx-2 my-2 transform transition duration-500 hover:scale-105 cursor-pointer'>
            <DropDown title='title' items={[...specialItems,1,2]} getItem={getItem} isImage={true} isSvg={true} image={<Menu height={24} width={24} />} />
          </div>
        </div>
      </div>
    </>
  )
}
