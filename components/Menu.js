import { useState } from 'react';
import { useRouter } from 'next/router';
import {ChevronRightIcon, ChevronLeftIcon, PencilIcon} from '@heroicons/react/solid';


export default function Menu({ children, handleClick }) {
  const ROUTER = useRouter();
  const [activeMenu, setActiveMenu] = useState('main');

  function MenuItem(props) {
    return (
      <button
        onClick={props.click}
        className={`flex flex-nowrap gap-2 py-6 border-t border-gray-200 hover:bg-gray-50 cursor-pointer ${props.class}`}
      >
        <div>{props.leftIcon}</div>
        {props.children}
        <div>{props.rightIcon}</div>
      </button>
    );
  }

  return (
    <div className="flex flex-col">

      {activeMenu === 'main' && 
        <>
          {/* <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            rightIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">Direct Link</div>
          </MenuItem> */}
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            rightIcon={<ChevronRightIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('explore')}
          >
            <div className="text-gray-400 text-base text-left w-full">Explore</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            rightIcon={<ChevronRightIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('trade')}
          >
            <div className="text-gray-400 text-base text-left w-full">Trade</div>
          </MenuItem>
        </>
      }
      
      {activeMenu === 'explore' && 
        <>
          <MenuItem
            leftIcon={<ChevronLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('main')}
          >
            <div className="text-gray-400 text-base text-left w-full">Back</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">All NFTs</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">All Collections</div>
          </MenuItem>
        </>
      }
      
      {activeMenu === 'trade' && 
        <>
          <MenuItem
            leftIcon={<ChevronLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => setActiveMenu('main')}
          >
            <div className="text-gray-400 text-base text-left w-full">Back</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">Create</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">Sell</div>
          </MenuItem>
          <MenuItem
            leftIcon={<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            click={() => {ROUTER.push('/'); handleClick(false)}}
          >
            <div className="text-gray-400 text-base text-left w-full">Transfer</div>
          </MenuItem>
        </>
      }

      <MenuItem
        click={() => {handleClick(false)}}
        class="border-b"
      >
        <div className="text-gray-400 text-base w-full">Close</div>
      </MenuItem>

    </div>
  );
}
