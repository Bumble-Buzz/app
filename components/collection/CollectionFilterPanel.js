import { useEffect, useState, useReducer } from 'react';
import { FilterPanel, FILTER_TYPES } from '@/components/filters/FilterPanel';
import TypeFilter from '@/components/filters/TypeFilter';
import PriceFilter from '@/components/filters/PriceFilter';


const BATCH_SIZE = 40;
const FILTERS = {
  panel: {},
  page: {}
};


export default function CollectionFilterPanel({ }) {

  /** reducer **/
  const reducer = (state, action) => {
    let newState;
    switch(action.type) {
      case 'type':
        newState = JSON.parse(JSON.stringify(state));
        newState.type.isSelected = !state.type.isSelected;
        return newState
      case 'price':
        newState = JSON.parse(JSON.stringify(state));
        newState.price.isSelected = !state.price.isSelected;
        return newState
      case 'clear':
        FILTERS.panel = {};
        FILTERS.page = {};
        newState.collections.items = {};
        return newState
      case 'update':
        newState = JSON.parse(JSON.stringify(state));
        return newState
      default:
        return state
    }
  };

  /** filter config **/
  const filterConfig = [
    {
      name: 'type',
      label: 'Type',
      component: (<TypeFilter items={
        [
          { name: 'buyNow', label: 'Buy Now', type: FILTER_TYPES.SWITCH_BUTTON },
          { name: 'auction', label: 'Auction', type: FILTER_TYPES.SWITCH_BUTTON }
        ]
      } />)
    },
    {
      name: 'price',
      label: 'Price',
      component: (<PriceFilter items={
        [
          { name: 'min', label: 'Min', type: FILTER_TYPES.INPUT_FIELD },
          { name: 'max', label: 'Max', type: FILTER_TYPES.INPUT_FIELD }
        ]
      } />)
    }
  ];

  /** filter state **/
  const [filterState, dispatch] = useReducer(reducer, {
    type: {
      isSelected: true,
      items: {}
    },
    price: {
      isSelected: true,
      items: {}
    }
  });


  return (<FilterPanel isShowingInit={true} filters={filterConfig} state={filterState} dispatch={dispatch} />)
}
