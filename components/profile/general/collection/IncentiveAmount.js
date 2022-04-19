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

export default function IncentiveAmount({ isLoading, setLoading, account, setAccount, contractAddress, ownerIncentiveAccess }) {
  const { data: session, status: sessionStatus } = useSession();

  const [isDialog, setDialog] = useState(false);

  const depositAction = async (e, _depositAmount) => {
    e.preventDefault();

    try {
      setLoading(INCENTIVE_DEPOSIT);
      setDialog(false);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // deposit incentives
      const val = await contract.depositIncentiveCollectionAccount(contractAddress, { value: ethers.utils.parseEther(_depositAmount.toString()) });

      await WalletUtil.checkTransaction(val);

      const listener = async (user, _contractAddress, _amount) => {
        const amountInt = Number(_amount);
        const amount = Number(ethers.utils.formatEther(amountInt.toString()));
        console.log('found deposit incentive event: ', user, _contractAddress, Number(_amount));
        if (session.user.id === user && contractAddress === _contractAddress) {
          Toast.success(`Incentive deposited: ${amount} ETH`);
          setAccount(account+amount);
          setLoading(null);
          contract.off("onDepositCollectionIncentive", listener);
        }
      };
      contract.on("onDepositCollectionIncentive", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };
  const deposit = async (e) => {
    e.preventDefault();

    DIALOG.title = 'Deposit to incentive pool';
    DIALOG.content = () => (<IncentiveDeposit action={depositAction} />);
    setDialog(true);
  };

  const withdrawAction = async (e, _withdrawAmount) => {
    e.preventDefault();

    try {
      setLoading(INCENTIVE_WITHDRAW);
      setDialog(false);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      // withdraw incentives
      const val = await contract.withdrawIncentiveCollectionAccount(contractAddress, ethers.utils.parseEther(_withdrawAmount.toString()));

      await WalletUtil.checkTransaction(val);

      const listener = async (user, _contractAddress, _amount) => {
        const amountInt = Number(_amount);
        const amount = Number(ethers.utils.formatEther(amountInt.toString()));
        if (session.user.id === user && contractAddress === _contractAddress) {
          Toast.success(`Incentive withdrawn: ${amount} ETH`);
          setAccount(account-amount);
          setLoading(null);
          contract.off("onWithdrawCollectionIncentive", listener);
        }
      };
      contract.on("onWithdrawCollectionIncentive", listener);
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };
  const withdraw = async (e) => {
    e.preventDefault();

    DIALOG.title = 'Withdraw from incentive pool';
    DIALOG.content = () => (<IncentiveWithdraw action={withdrawAction}  max={account} />);
    setDialog(true);
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
