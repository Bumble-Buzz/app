import { useEffect, useState, useReducer } from 'react';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import { useFilter, FILTER_CONTEXT_ACTIONS } from '@/contexts/FilterContext';


export default function ExplorePriceFilter({children, items}) {
  const FilterContext = useFilter();

  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');

  return (
    <>
      {items.map((item, index) => {
        return (
          <div key={index} className='flex flex-col grow'>
            <label htmlFor={item.name} className="block text-sm font-medium text-gray-700">{item.label}</label>
            <InputWrapper
              type="number"
              // type="range"
              min="0"
              id={item.name}
              name={item.name}
              aria-label="price-search"
              aria-describedby="price-search"
              placeholder={item.name}
              value={item.name === 'min' ? minVal : maxVal}
              classes="w-full sm:w-52 font-normal"
              onChange={(e) => {
                if (item.name === 'min') setMinVal(e.target.value);
                if (item.name === 'max') setMaxVal(e.target.value);
                FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.PRICE_ITEMS, payload: { item: item.name, value: Number(e.target.value) } });
              }}
            />
          </div>
        )
      })}

      <div className='flex flex-col grow'>
        <ButtonWrapper
          onClick={() => {
            setMinVal('');
            setMaxVal('');
            FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.DIRTY, payload: { dirty: true } })
          }}
          classes="grow bg-indigo-600 hover:bg-indigo-800"
        >
          Apply
        </ButtonWrapper>
      </div>
    </>
  )
}
