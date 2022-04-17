import { useState } from 'react';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';


export default function IncentiveWithdraw({ action, max }) {
  const [input, setInput] = useState('');

  return (
    <form onSubmit={(e) => action(e, input)}>
      <label
        htmlFor="incentive-withdraw"
        className="block text-sm font-medium text-gray-700 cursor-pointer"
        onClick={() => setInput(Number(max))}
      >
        MAX: {max}
      </label>
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
          value={input}
          onChange={(e) => setInput(Number(e.target.value))}
        />
        <ButtonWrapper type="submit" classes='px-1 py-1 w-full'>Withdraw</ButtonWrapper>
      </div>
    </form>
  )
}
