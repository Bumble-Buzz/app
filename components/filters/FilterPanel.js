import { useEffect, useState, useReducer } from 'react';
import { Transition } from '@headlessui/react';
import ButtonWrapper from '../wrappers/ButtonWrapper';
import InputWrapper from '../wrappers/InputWrapper';
import HeadlessSwitch from '../HeadlessSwitch';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import {ChevronRightIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, FilterIcon, SearchIcon} from '@heroicons/react/solid';
import {
  PencilIcon as PencilIconOutline
} from '@heroicons/react/outline';


export const FILTER_TYPES = {
  SEARCH: 'search',
  SWITCH: 'switch',
  BUTTON: 'button',
  SWITCH_BUTTON: 'switch-button',
  RADIO_BUTTON: 'radio-button',
  INPUT_FIELD: 'input-field'
};

export const FilterPanel = ({ children, isShowingInit = false, filters, state, dispatch }) => {
  const { width: currentWindowWidth } = useWindowDimensions();

  const [isShowing, setIsShowing] = useState(false);

  // if screen size is md (640px) or greater, only then use the passed in value. Else, always keep the panel closed
  useEffect(() => {
    if (currentWindowWidth && currentWindowWidth < 640) {
      setIsShowing(false);
    } else {
      setIsShowing(isShowingInit);
    }
  }, [currentWindowWidth]);


  const MenuItem = (props) => {
    return (
      <button
        onClick={props.click}
        className={`pl-2 flex flex-nowrap flex-row w-full gap-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${props.class}`}
      >
        <div>{props.leftIcon}</div>
        {props.children}
        <div>{props.rightIcon}</div>
      </button>
    );
  };

  const MenuSubItem = (props) => {
    return (
      <form onSubmit={(e) => {if (props.filter.payload.onSubmit(e)) props.filter.add()} } method="POST"
        className={`px-4 py-2 flex flex-col flex-nowrap gap-2 border-t border-gray-200 ${props.class}`}
      >
        {props.filter.items && props.filter.items.length > 0 && props.filter.items.map((item, index) => {
          return (
            <div key={index} className="flex flex-row grow">
              {item.type === FILTER_TYPES.SEARCH && <SearchBar item={item} filterItem={props.filter.filterItem} />}
              {item.type === FILTER_TYPES.BUTTON && <Button item={item} />}
              {item.type === FILTER_TYPES.SWITCH_BUTTON && <SwitchButton item={item} filterName={props.filter.name} filterItem={props.filter.filterItem} filterAdd={props.filter.add} filterRemove={props.filter.remove} />}
              {item.type === FILTER_TYPES.INPUT_FIELD && <InputField item={item} filterName={props.filter.name} filterItem={props.filter.filterItem} />}
              {item.type === FILTER_TYPES.SWITCH && <Switch item={item} filterName={props.filter.name} filterItem={props.filter.filterItem} filterAdd={props.filter.add} filterRemove={props.filter.remove} />}
            </div>
          )
        })}
      </form>
    )
  };

  const MenuSubItemComponent = (props) => {
    return (
      <form onSubmit={(e) => {if (props.filter.payload.onSubmit(e)) props.filter.add()} } method="POST"
        className={`px-4 py-2 flex flex-col flex-nowrap gap-2 border-b border-gray-200 ${props.class}`}
      >
        {props.filter.component}
      </form>
    )
  };

  const SearchBar = ({item, filterItem}) => {
    return (
      <InputWrapper
        type="search"
        id={item.name}
        name={item.name}
        placeholder={item.label}
        aria-label={item.name}
        aria-describedby={item.name}
        classes="w-full sm:w-52"
        onChange={(e) => dispatch({ type: filterItem, payload: { item: item.name, [item.name]: e.target.value } })}
      />
    )
  };

  const Button = ({item}) => {
    return (<ButtonWrapper type={item.payload.type} classes="grow">{item.label}</ButtonWrapper>)
  };

  const SwitchButton = ({item, filterName, filterItem, filterAdd, filterRemove}) => {
    return (
      state[filterName].items[item.name] ?
      (<ButtonWrapper
        onClick={() => {
          dispatch({ type: filterItem, payload: { item: item.name } });
          filterRemove(item.name);
        }}
        classes="grow bg-indigo-800 hover:bg-indigo-600"
      >
        {item.label}
      </ButtonWrapper>)
      :
      (<ButtonWrapper
        onClick={() => {
          dispatch({ type: filterItem, payload: { item: item.name } });
          filterAdd(item.name);
        }}
        classes="grow bg-indigo-600 hover:bg-indigo-800"
      >
        {item.label}
      </ButtonWrapper>)
    )
  };

  const InputField = ({item, filterName, filterItem}) => {
    return (
      <div className="w-full">
        <label htmlFor={item.name} className="block text-sm font-medium text-gray-700">{item.label}</label>
        <InputWrapper
          type="number"
          // type="range"
          min="0"
          // max="99"
          id={item.name}
          name={item.name}
          // required
          classes="w-full sm:w-52 font-normal"
          placeholder={state[filterName].items[item.name]}
          // defaultValue={state[filterName].items[item.name]}
          onChange={(e) => dispatch({ type: filterItem, payload: { item: item.name, [item.name]: parseInt(e.target.value,10) } })}
          // onBlur={() => dispatch({ type: 'update' })}
        />
      </div>
    )
  };

  const Switch = ({item, filterName, filterItem, filterAdd, filterRemove}) => {
    return (
      state[filterName].items[item.name] ? (
        <HeadlessSwitch
          classes=""
          enabled={state[filterName].items[item.name]}
          onChange={() => {
            dispatch({ type: filterItem, payload: { item: item.name } });
            filterRemove(item.name);
          }}
        >
          {item.label}
        </HeadlessSwitch>
      ) : (
        <HeadlessSwitch
          classes=""
          enabled={state[filterName].items[item.name]}
          onChange={() => {
            dispatch({ type: filterItem, payload: { item: item.name } });
            filterAdd(item.name);
          }}
        >
          {item.label}
        </HeadlessSwitch>
      )
    )
  };
  
  return (
  <div className="flex flex-col sticky top-16 overflow-y-auto sm:[height:calc(100vh-4rem)] h-fit">
      {isShowing ?
        (<MenuItem
          leftIcon={<FilterIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
          rightIcon={<ChevronLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
          click={() => setIsShowing(!isShowing)}
          class="py-3 sm:w-60"
        >
          <div className="text-gray-400 text-base text-left w-full">Filter</div>
        </MenuItem>)
        :
        (<MenuItem
          leftIcon={<FilterIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
          rightIcon={<ChevronRightIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
          click={() => setIsShowing(!isShowing)}
          class="py-3"
        >
        </MenuItem>)
      }
      
      <Transition
        show={isShowing}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {filters && filters.length > 0 && filters.map((filter, index) => {
          return (
            <div key={index}>
              {state[filter.name].isSelected ?
                (<>
                  <MenuItem
                    rightIcon={<ChevronUpIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
                    click={() => dispatch({ type: filter.name })}
                    class="py-6"
                  >
                    <div className="text-gray-400 text-base text-left w-full">{filter.label}</div>
                  </MenuItem>
                  {filter.component ? (
                    <MenuSubItemComponent filter={filter} />
                  ) : (
                    <MenuSubItem filter={filter} class={filter.class} />
                  )}
                </>)
                :
                (<>
                  <MenuItem
                    rightIcon={<ChevronDownIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
                    click={() => dispatch({ type: filter.name })}
                    class="py-6"
                  >
                    <div className="text-gray-400 text-base text-left w-full">{filter.label}</div>
                  </MenuItem>
                </>)
              }
            </div>
          )
        })}
      </Transition>
    </div>
  )
}
