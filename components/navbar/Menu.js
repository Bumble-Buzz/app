import { Fragment, useState } from 'react';
import { useRouter } from 'next/router';
import { Transition } from '@headlessui/react';
import {ChevronRightIcon, ChevronLeftIcon, PencilIcon, SearchIcon, XIcon} from '@heroicons/react/solid';


export default function Menu({ children, handleClick }) {
  const ROUTER = useRouter();
  const [activeMenu, setActiveMenu] = useState('main');

  function SearchBar(props) {
    return (
      <div className="flex flex-1 ml-2 items-center input-group relative flex items-stretch w-full">
        <input type="search" className="sm:hidden flex form-control relative flex-auto min-w-0 block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-l-lg transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" placeholder="Search" aria-label="Search" aria-describedby="search"></input>
        <button className="sm:hidden flex btn mr-3 px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded-r-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex items-center" type="button" id="search">
          <div className="h-5 w-5"><SearchIcon className="w-5 h-5 mr-2" aria-hidden="true" /></div>
        </button>
      </div>
    );
  }

  function MenuItem(props) {
    return (
      <button
        onClick={props.click}
        className={`flex flex-nowrap gap-2 border-t border-gray-200 hover:bg-gray-50 cursor-pointer ${props.class}`}
      >
        <div>{props.leftIcon}</div>
        {props.children}
        <div>{props.rightIcon}</div>
      </button>
    );
  }

  return (
    <>
      <SearchBar></SearchBar>
      <div className="flex flex-col">

        <Transition
          show={activeMenu === 'main'}
          enter="transform transition ease-linear duration-300"
          enterFrom="absolute -translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-linear duration-200"
          leaveFrom="translate-x-0"
          leaveTo="absolute -translate-x-full"
          className="flex flex-col"
        >
          {/* <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            rightIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">Direct Link</div>
          </MenuItem> */}
          
          <MenuItem
            leftIcon={<XIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {handleClick(false)}}
            class="mx-2 py-3"
          >
            <div className="text-gray-400 text-base text-left w-full">Exit</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            rightIcon={<ChevronRightIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('explore')}
            class="mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">Explore</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            rightIcon={<ChevronRightIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('trade')}
            class="border-b mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">Trade</div>
          </MenuItem>
        </Transition>

        <Transition
          show={activeMenu === 'explore'}
          enter="transform transition ease-linear duration-300"
          enterFrom="absolute translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-linear duration-200"
          leaveFrom="translate-x-0"
          leaveTo="absolute translate-x-full"
          className="flex flex-col"
        >
          <MenuItem
            leftIcon={<ChevronLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('main')}
            class="mx-2 py-3"
          >
            <div className="text-gray-400 text-base text-left w-full">Explore</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
            class="mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">All NFTs</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
            class="border-b mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">All Collections</div>
          </MenuItem>
        </Transition>


        <Transition
          show={activeMenu === 'trade'}
          enter="transform transition ease-linear duration-300"
          enterFrom="absolute translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-linear duration-200"
          leaveFrom="translate-x-0"
          leaveTo="absolute translate-x-full"
          className="flex flex-col"
        >
          <MenuItem
            leftIcon={<ChevronLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('main')}
            class="mx-2 py-3"
          >
            <div className="text-gray-400 text-base text-left w-full">Trade</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/asset/create'); handleClick(false)}}
            class="mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">Create</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
            class="mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">Sell</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
            class="border-b mx-2 py-6"
          >
            <div className="text-gray-400 text-base text-left w-full">Transfer</div>
          </MenuItem>
        </Transition>

        {/* <MenuItem
          click={() => {handleClick(false)}}
          class="border-b mx-2 py-6"
        >
          <div className="text-gray-400 text-base w-full">Close</div>
        </MenuItem> */}

      </div>
    </>
  );
}
