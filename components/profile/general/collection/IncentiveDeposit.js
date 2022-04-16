import { useEffect, useState } from 'react';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';


export default function IncentiveDeposit({ setOpen, account }) {

  const [input, setInput] = useState('');

  const deposit = async (e) => {
    e.preventDefault();

    console.log('deposit', input);
    setOpen(false);
  };

  return (
    <form onSubmit={deposit}>
      <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">
        <InputWrapper
          type="number"
          id="incentive-withdraw"
          min="0"
          max={account}
          step="any"
          name="incentive-withdraw"
          aria-label="incentive-withdraw"
          aria-describedby="incentive-withdraw"
          classes="w-full"
          onChange={(e) => setInput(Number(e.target.value))}
        />
        <ButtonWrapper type="submit" classes='px-1 py-1 w-full'>Deposit</ButtonWrapper>
      </div>
    </form>
  )
}
