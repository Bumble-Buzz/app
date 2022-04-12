import { useEffect, useState, useReducer } from 'react';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import { useFilter, FILTER_CONTEXT_ACTIONS } from '@/contexts/FilterContext';


export default function ExploreTypeFilter({children, items}) {
  const FilterContext = useFilter();


  return (
    <>
      {items.map((item, index) => {
        return (
          <div key={index} className='flex flex-col grow'>
            {FilterContext.state.type[item.name] ?
              (<ButtonWrapper
                onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.TYPE_ITEMS, payload: { item: item.name } }) }
                classes="grow bg-indigo-800 hover:bg-indigo-600"
              >
                {item.label}
              </ButtonWrapper>)
            :
            (<ButtonWrapper
              onClick={() => FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.TYPE_ITEMS, payload: { item: item.name } }) }
              classes="grow bg-indigo-600 hover:bg-indigo-800"
            >
              {item.label}
            </ButtonWrapper>)}
          </div>
        )
      })}
    </>
  )
}
