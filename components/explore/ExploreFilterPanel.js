import { useReducer } from 'react';
import useSWR from 'swr';
import API from '@/components/Api';
import { FilterPanel, FILTER_TYPES } from '@/components/filters/FilterPanel';
import TypeFilter from '@/components/filters/TypeFilter';
import PriceFilter from '@/components/filters/PriceFilter';
import CategoriesFilter from '@/components/filters/CategoriesFilter';
import CollectionsFilter from '@/components/filters/CollectionsFilter';


const BATCH_SIZE = 40;
const FILTERS = {
  panel: {},
  page: {}
};


export default function ExploreContent({ }) {
  const {data: collectionInit} = useSWR(API.swr.collection.active('null', BATCH_SIZE), API.swr.fetcher, API.swr.options);

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
      case 'collections':
        newState = JSON.parse(JSON.stringify(state));
        newState.collections.isSelected = !state.collections.isSelected;
        return newState
      case 'categories':
        newState = JSON.parse(JSON.stringify(state));
        newState.categories.isSelected = !state.categories.isSelected;
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
    },
    {
      name: 'collections',
      label: 'Collections',
      component: (<CollectionsFilter collectionInit={collectionInit} />)
    },
    {
      name: 'categories',
      label: 'Categories',
      component: (<CategoriesFilter collectionInit={collectionInit} />)
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
    },
    collections: {
      isSelected: false,
      items: {}
    },
    categories: {
      isSelected: false,
      items: {}
    }
  });


  return (<FilterPanel isShowingInit={true} filters={filterConfig} state={filterState} dispatch={dispatch} />)
}
