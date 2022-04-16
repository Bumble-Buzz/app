import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import IncentiveWithdraw from '@/components/profile/general/collection/IncentiveWithdraw';
import IncentiveDeposit from '@/components/profile/general/collection/IncentiveDeposit';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import HeadlessDialog from '@/components/HeadlessDialog';
import Toast from '@/components/Toast';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


const INCENTIVE_DEPOSIT = 'incentive_deposit';
const INCENTIVE_WITHDRAW = 'incentive_withdraw';
const DIALOG = { title: '', content: () => {} };

export default function CollectionIncentive({ isLoading, setLoading, account, setAccount, ownerIncentiveAccess }) {
  const { data: session, status: sessionStatus } = useSession();

  const [isDialog, setDialog] = useState(false);

  const claimTimeout = () => {
    console.log('start timeout');
    setTimeout(() => {
      setAccount(0);
      setLoading(null);
      console.log('end timeout');
    }, 5000);
  };

  const deposit = async (e) => {
    e.preventDefault();

    DIALOG.title = 'Deposit to incentive pool';
    DIALOG.content = () => (<IncentiveDeposit  setOpen={setDialog} account={account} />);

    setDialog(true);

    try {
      setLoading(INCENTIVE_WITHDRAW);

      console.log('isLoading', isLoading);
      console.log('ACCOUNT_IDENTIFIER:', INCENTIVE_WITHDRAW);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // claim rewards
      claimTimeout();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };

  const withdraw = async (e) => {
    e.preventDefault();

    DIALOG.title = 'Withdraw from incentive pool';
    DIALOG.content = () => (<IncentiveWithdraw setOpen={setDialog} account={account} />);

    setDialog(true);

    try {
      setLoading(INCENTIVE_WITHDRAW);

      console.log('isLoading', isLoading);
      console.log('ACCOUNT_IDENTIFIER:', INCENTIVE_WITHDRAW);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // claim rewards
      claimTimeout();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };

  return (
    <>
      {isLoading && (isLoading === INCENTIVE_DEPOSIT || isLoading === INCENTIVE_WITHDRAW) && (
        <ButtonWrapper disabled type="submit">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />Processing
        </ButtonWrapper>
      )}
      {isLoading && isLoading !== INCENTIVE_DEPOSIT && isLoading !== INCENTIVE_WITHDRAW && (<>
        <ButtonWrapper disabled classes='bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center'>Deposit</ButtonWrapper>
        {ownerIncentiveAccess && (<ButtonWrapper disabled classes='bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center'>Withdraw</ButtonWrapper>)}
      </>)}
      {!isLoading && (<>
        <ButtonWrapper classes='px-1 py-1' onClick={deposit}>Deposit</ButtonWrapper>
        {ownerIncentiveAccess && (<ButtonWrapper classes='px-1 py-1' onClick={withdraw}>Withdraw</ButtonWrapper>)}
      </>)}
      <HeadlessDialog open={isDialog} setOpen={setDialog} title={DIALOG.title} content={DIALOG.content()} />
    </>
  )
}
