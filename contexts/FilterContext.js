import { useReducer, useContext, createContext } from 'react';

const FilterContext = createContext();

export const FILTER_CONTEXT_ACTIONS = {
  TYPE: 'type',
  TYPE_ITEMS: 'type-items',
  TYPE_CLEAR: 'type-clear',
  PRICE: 'price',
  PRICE_ITEMS: 'price-items',
  PRICE_CLEAR: 'price-clear',
  COLLECTIONS: 'collections',
  COLLECTIONS_ITEMS: 'collections-items',
  COLLECTIONS_CLEAR: 'collections-clear',
  CATEGORIES: 'categories',
  CATEGORIES_ITEMS: 'categories-items',
  CATEGORIES_CLEAR: 'categories-clear',
  DIRTY: 'dirty',
  CLEAR_SPECIFIC: 'clear-specific',
  CLEAR: 'clear'
};

export const useFilter = () => {
  return useContext(FilterContext);
};

export const _arrAddRemove = ([..._data] = [], _element) => {
  if (!_element) return [..._data];

  const index = _data.indexOf(_element);
  const exists = (index >= 0);
  if (exists) {
    const length = _data.length;
    _data[index] = _data[length-1];
    _data.pop();
  } else {
    _data.push(_element);
  }
  return [..._data];
};


const _doesArrayInclude = (_array, _identifier = {}) => {
  const match = _array.find((arrayElement) => {
      return _.isEqual(arrayElement, _identifier);
  });
  return match == undefined ? false : true;
};
const _sortAssets = (_data = [], _comparator = []) => {
  return _data.sort((a, b) => {
    const aVal = _doesArrayInclude(_comparator, a.id);
    const bVal = _doesArrayInclude(_comparator, b.id);
    if (aVal === bVal) return 0;
    if (aVal === true) return -1;
    if (bVal === true) return 1;
  });
};

const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    // type
    case FILTER_CONTEXT_ACTIONS.TYPE:
      newState = JSON.parse(JSON.stringify(state));
      newState.type = action.payload.items;
      newState.dirty = true;
      return newState
    case FILTER_CONTEXT_ACTIONS.TYPE_ITEMS:
      newState = JSON.parse(JSON.stringify(state));
      newState.type[action.payload.item] = !state.type[action.payload.item];
      newState.dirty = true;
      return newState
    case FILTER_CONTEXT_ACTIONS.TYPE_CLEAR:
      newState = JSON.parse(JSON.stringify(state));
      newState.type[action.payload.item] = null;
      newState.dirty = true;
      return newState
    // price
    case FILTER_CONTEXT_ACTIONS.PRICE:
      newState = JSON.parse(JSON.stringify(state));
      newState.price = action.payload.items;
      newState.dirty = true;
      return newState
    case FILTER_CONTEXT_ACTIONS.PRICE_ITEMS:
      newState = JSON.parse(JSON.stringify(state));
      state.price[action.payload.item] = action.payload.value;
      state.dirty = true;
      return state
    case FILTER_CONTEXT_ACTIONS.PRICE_CLEAR:
      newState = JSON.parse(JSON.stringify(state));
      state.price[action.payload.item] = null;
      state.dirty = true;
      return state
    // collections
    case FILTER_CONTEXT_ACTIONS.COLLECTIONS:
      newState = JSON.parse(JSON.stringify(state));
      newState.collections.items = action.payload.collections;
      newState.collections.exclusiveStartKey = action.payload.exclusiveStartKey;
      newState.dirty = true;
      return newState
    case FILTER_CONTEXT_ACTIONS.COLLECTIONS_ITEMS:
      newState = JSON.parse(JSON.stringify(state));
      newState.collections.selected = _arrAddRemove([...newState.collections.selected], action.payload.collection);
      newState.dirty = true;
      return newState
    // categories
    case FILTER_CONTEXT_ACTIONS.CATEGORIES:
      newState = JSON.parse(JSON.stringify(state));
      newState.categories = action.payload.categories;
      newState.dirty = true;
      return newState
    case FILTER_CONTEXT_ACTIONS.CATEGORIES_ITEMS:
      newState = JSON.parse(JSON.stringify(state));
      // turn off all category selections, only turn on selected one. only one can be selected at a time
      Object.getOwnPropertyNames(state.categories).forEach(key => newState.categories[key] = false);
      newState.categories[action.payload.category] = !state.categories[action.payload.category];
      newState.dirty = true;
      return newState
    // misc
    case FILTER_CONTEXT_ACTIONS.DIRTY:
      newState = JSON.parse(JSON.stringify(state));
      newState.dirty = action.payload.dirty;
      return newState
    case FILTER_CONTEXT_ACTIONS.CLEAR_SPECIFIC:
      newState = JSON.parse(JSON.stringify(state));
      if (action.payload.filter === 'type') {
        if (action.payload.item === 'buyNow') newState.type.buyNow = null;
        if (action.payload.item === 'auction') newState.type.auction = null;
      }
      if (action.payload.filter === 'price') newState.price = { min: 0, max: 0 };
      if (action.payload.filter === 'collections') {
        if (action.payload.item === 'items') newState.collections.selected = [];
      }
      if (action.payload.filter === 'categories') Object.getOwnPropertyNames(newState.categories).forEach(key => newState.categories[key] = false);
      newState.dirty = true;
      return newState
    case FILTER_CONTEXT_ACTIONS.CLEAR:
      newState = JSON.parse(JSON.stringify(state));
      newState.type = { buyNow: null, auction: null };
      newState.price = { min: 0, max: 0 };
      if (newState.collections) {
        newState.collections.selected = [];
      }
      if (newState.categories) {
        Object.getOwnPropertyNames(newState.categories).forEach(key => newState.categories[key] = false);
      }
      newState.dirty = true;
      return newState
    default:
      state.dirty = false;
      return state
  }
};

export const FilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    dirty: false,
    type: {
      buyNow: null,
      auction: null
    },
    price: {
      min: 0,
      max: 0
    },
    collections: {
      selected: [],
      items: null,
      exclusiveStartKey: null
    },
    categories: null
  });

  return (
    <FilterContext.Provider value={{ state, dispatch }}>
      {children}
    </FilterContext.Provider>
  )
};
