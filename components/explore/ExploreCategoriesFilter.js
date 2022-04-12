import { useEffect, useState, useReducer } from 'react';
import HeadlessSwitch from '@/components/HeadlessSwitch';
import { CATEGORIES } from '@/enum/Categories';
import { useFilter, FILTER_CONTEXT_ACTIONS } from '@/contexts/FilterContext';


export default function ExploreCategoriesFilter({ }) {
  const FilterContext = useFilter();

  useEffect(() => {
    if (!FilterContext.state.categories) {
      FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CATEGORIES, payload: { categories: getCategoriesState() } });
    }
  }, []);

  const getCategoriesState = () => {
    let state = {};
    Object.getOwnPropertyNames(CATEGORIES).forEach((key) => {
      state[key] = false;
    });
    return state;
  };

  return (
    <>
      <div className='flex flex-col gap-2 '>
        {FilterContext.state.categories && Object.getOwnPropertyNames(FilterContext.state.categories).map((category, index) => {
          return (
            <div key={index} className='flex flex-col grow'>
              <HeadlessSwitch
                classes=""
                enabled={FilterContext.state.categories[category]}
                onChange={() => {
                  FilterContext.dispatch({ type: FILTER_CONTEXT_ACTIONS.CATEGORIES_ITEMS, payload: { category: category } });
                }}
              >
                {category}
              </HeadlessSwitch>
            </div>
          )
        })}
      </div>
    </>
  )
}
