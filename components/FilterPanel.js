import { useState, useReducer } from 'react';
import { Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import ButtonWrapper from './wrappers/ButtonWrapper';
import InputWrapper from './wrappers/InputWrapper';
import {ChevronRightIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, FilterIcon} from '@heroicons/react/solid';
import {
  PencilIcon as PencilIconOutline
} from '@heroicons/react/outline';


export const FILTER_TYPES = {
  BUTTON: 'button',
  SWITCH_BUTTON: 'switch-button',
  RADIO_BUTTON: 'radio-button',
  INPUT_FIELD: 'input-field',
  SELECT: 'select',
};

export const FilterPanel = ({ children, filters, state, dispatch }) => {
  const [isShowing, setIsShowing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(false);

  // console.log('filters', filters);

  const MenuItem = (props) => {
    return (
      <button
        onClick={props.click}
        className={`pl-2 flex flex-nowrap flex-row w-full gap-2 border-t border-gray-200 hover:bg-gray-50 cursor-pointer ${props.class}`}
      >
        <div>{props.leftIcon}</div>
        {props.children}
        <div>{props.rightIcon}</div>
      </button>
    );
  };

  const MenuSubItem = (props) => {
    return (
      <div className={`px-4 py-2 flex flex-col flex-wrap gap-2 border-t border-gray-200 hover:bg-gray-50 ${props.class}`}>
        {props.items && props.items.length > 0 && props.items.map((item, index) => {
          return (
            <div key={index} className="flex flex-row grow">
              {item.type === FILTER_TYPES.BUTTON && <Button item={item} />}
              {item.type === FILTER_TYPES.SWITCH_BUTTON && <SwitchButton item={item} filterName={props.filterName} />}
              {item.type === FILTER_TYPES.INPUT_FIELD && <InputField item={item} filterName={props.filterName} />}
            </div>
          )
        })}
      </div>
    )
  };

  const Button = ({item}) => {
    return (<ButtonWrapper classes="grow">{item.label}</ButtonWrapper>)
  };

  const SwitchButton = ({item, filterName}) => {
    return (
      state[filterName].items[item.name] ?
      (<ButtonWrapper
        onClick={() => dispatch({ type: item.name })}
        classes="grow bg-indigo-800 hover:bg-indigo-600"
      >
        {item.label}
      </ButtonWrapper>)
      :
      (<ButtonWrapper
        onClick={() => dispatch({ type: item.name })}
        classes="grow bg-indigo-600 hover:bg-indigo-800"
      >
        {item.label}
      </ButtonWrapper>)
    )
  };

  const InputField = ({item, filterName}) => {
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
          classes="w-full sm:w-52"
          placeholder={state[filterName].items[item.name]}
          onChange={(e) => dispatch({ type: item.name, payload: { [item.name]: parseInt(e.target.value,10) } })}
          onBlur={() => dispatch({ type: 'update' })}
        />
      </div>
    )
  };


  return (
    <div className="flex flex-col">
      {/* hidden sm:block  */}
      {/* {console.log('isShowing', isShowing)} */}
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
                  <MenuSubItem filterName={filter.name} items={filter.items} class="" />
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
