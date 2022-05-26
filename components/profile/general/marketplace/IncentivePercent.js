import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import HeadlessDialog from '@/components/HeadlessDialog';
import Toast from '@/components/Toast';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import AvaxTradeAbi from '@/artifacts/contracts/AvaxTrade.sol/AvaxTrade.json';


const IDENTIFIER = 'incentive_percent';
const DIALOG = { title: '', content: () => {} };

export default function IncentivePercent({ isLoading, setLoading, account, setAccount }) {
  const { data: session, status: sessionStatus } = useSession();
  const [isDialog, setDialog] = useState(false);

  const depositAction = async (e, _value) => {
    e.preventDefault();

    try {
      setLoading(IDENTIFIER);
      setDialog(false);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AVAX_TRADE_CONTRACT_ADDRESS, AvaxTradeAbi.abi, signer);

      const listener = async (user, _amount) => {
        const amountInt = Number(_amount);
        const amount = Number(ethers.utils.formatEther(amountInt.toString()));
        console.log('found deposit incentive event: ', Number(_amount));
        if (session.user.id === user) {
          Toast.success(`Incentive deposited: ${amount} ETH`);
          setAccount(account+amount);
          setLoading(null);
          contract.off("onDepositMarketplaceIncentive", listener);
        }
      };
      contract.on("onDepositMarketplaceIncentive", listener);

      // deposit incentives
      const transaction = await contract.setMarketplaceIncentiveCommission(_value);
      // await WalletUtil.checkTransaction(transaction);
      await transaction.wait();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };
  const deposit = async (e) => {
    e.preventDefault();

    DIALOG.title = 'Update incentive pool percent';
    DIALOG.content = () => (<Action action={depositAction} />);
    setDialog(true);
  };

  return (
    <>
      {isLoading && (isLoading === IDENTIFIER) && (
        <ButtonWrapper disabled type="submit">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />Processing
        </ButtonWrapper>
      )}
      {isLoading && isLoading !== IDENTIFIER && (<>
        <ButtonWrapper disabled classes='bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center'>Update</ButtonWrapper>
      </>)}
      {!isLoading && (<>
        <ButtonWrapper classes='px-1 py-1' onClick={deposit}>Update</ButtonWrapper>
      </>)}
      <HeadlessDialog open={isDialog} setOpen={setDialog} title={DIALOG.title} content={DIALOG.content()} />
    </>
  )
}

const Action = ({ action }) => {
  const [input, setInput] = useState('');
  return (
    <form onSubmit={(e) => action(e, input)}>
      <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">
        <InputWrapper
          type="number"
          id="incentive-withdraw"
          min="0"
          step="any"
          name="incentive-withdraw"
          aria-label="incentive-withdraw"
          aria-describedby="incentive-withdraw"
          classes="w-full"
          onChange={(e) => setInput(Number(e.target.value))}
        />
        <ButtonWrapper type="submit" classes='px-1 py-1 w-full'>Update</ButtonWrapper>
      </div>
    </form>
  )
};
