import { useState, useReducer } from 'react';
import { FilterPanel, FILTER_TYPES } from '../FilterPanel';


const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case 'type':
      newState = JSON.parse(JSON.stringify(state));
      newState.type.isSelected = !state.type.isSelected;
      return newState
    case 'buyNow':
      newState = JSON.parse(JSON.stringify(state));
      newState.type.items.buyNow = !state.type.items.buyNow;
      console.log('newState.type.items.buyNow', newState.type.items.buyNow);
      return newState
    case 'auction':
      newState = JSON.parse(JSON.stringify(state));
      newState.type.items.auction = !state.type.items.auction;
      console.log('newState.type.items.auction', newState.type.items.auction);
      return newState
    case 'price':
      newState = JSON.parse(JSON.stringify(state));
      newState.price.isSelected = !state.price.isSelected;
      return newState
    case 'min':
      state.price.items.min = action.payload.min;
      return state
    case 'max':
      state.price.items.max = action.payload.max;
      return state
    case 'update':
      newState = JSON.parse(JSON.stringify(state));
      if (newState.price.items.min < 0) {
        newState.price.items.min = 0;
      }if (newState.price.items.max < 0) {
        newState.price.items.max = 0;
      }
      if (newState.price.items.min > newState.price.items.max) {
        newState.price.items.min = newState.price.items.max;
      }
      // console.log('newState', newState);
      return newState
    default:
      return state
  }
};

const filters = [
  {
    name: 'type',
    label: 'Type',
    items: [
      { name: 'buyNow', label: 'Buy Now', type: FILTER_TYPES.SWITCH_BUTTON },
      { name: 'auction', label: 'Auction', type: FILTER_TYPES.SWITCH_BUTTON }
    ]
  },
  {
    name: 'price',
    label: 'Price',
    items: [
      { name: 'min', label: 'Min', type: FILTER_TYPES.INPUT_FIELD },
      { name: 'max', label: 'Max', type: FILTER_TYPES.INPUT_FIELD }
    ]
  }
];


export default function Created() {

  const [state, dispatch] = useReducer(reducer, {
    type: {
      isSelected: false,
      items: {
        buyNow: false,
        auction: false
      }
    },
    price: {
      isSelected: false,
      items: {
        min: 0,
        max: 0
      }
    }
  });


  return (
    <>
      <div className="-p-2 -ml-2 rounded-lg shadow-lg bg-white">
        <FilterPanel filters={filters} state={state} dispatch={dispatch} />
      </div>
      <div className="p-1 rounded-lg shadow-lg bg-white grow">
        <p className="text-gray-700 text-base">Created</p>
      </div>
    </>
  )
}
