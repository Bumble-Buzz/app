
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import WALLTET from '../../utils/wallet';
import Menu from './Menu';
import Notification from './Notification';
import DropDown from './DropDown';

import HeadlessSlideOver from '../HeadlessSlideOver';

import {
  PencilIcon, SearchIcon, MenuIcon, XIcon, BellIcon, ShoppingCartIcon
} from '@heroicons/react/solid';
import {
  PencilIcon as PencilIconOutline
} from '@heroicons/react/outline';


function Navbar() {
  const ROUTER = useRouter();

  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notificationClickTime, setNotificationClickTime] = useState(0);
  const [notificationCount, setNotificationCount] = useState(1);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [menuClickTime, setMenuClickTime] = useState(0);

  const [isNavOpen, setNavOpen] = useState(false);
  const [walletState, setWalletState] = useState({
    isConnected: false,
    networkName: '',
    chainId: 0,
    address: '',
    displayString: 'Connect'
  });

  useEffect(() => {
    connectWallet();
  }, [isNavOpen, ROUTER.pathname]);

  const connectWallet = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!await WALLTET.isNetworkValid()) {
      console.error('Wrong network, switch to Avalanche');
      setWalletState({displayString: 'Network err'});
      return;
    }

    const signer = await WALLTET.getSigner();

    const address = await signer.getAddress();
    if (signer) {
      setWalletState({
        isConnected: true,
        address: address,
        displayString: address.substring(0, 7) + '...'
      });
    } else {
      setWalletState({
        isConnected: false,
        address: '',
        displayString: 'Connect'
      });
    }
  };

  const getItem = (itemId) => {
    switch(itemId) {
      case 1:
        return {
          label: 'All NFTs',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 2:
        return {
          label: 'All Collections',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 3:
        return {
          label: 'Categories below...',
          link: '/docs',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 7:
        return {
          label: 'Create',
          link: '/create',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 8:
        return {
          label: 'Sell',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 9:
        return {
          label: 'Transfer',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 11:
        return {
          label: 'Profile',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 12:
        return {
          label: 'My Collections',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 13:
        return {
          label: 'Preferences',
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      default:
        return {};
    };
  };

  const getNotificationCountString = () => {
    if (notificationCount > 9) {
      return '!'
    } else {
      return notificationCount;
    }
  };

  const handleNotificationClick = (action, fromHeadless) => {
    const diff = Date.now() - notificationClickTime;
    if (fromHeadless) {
      setNotificationOpen(action);
      setNotificationClickTime(Date.now());
    } else {
      if (diff > 250) {
        setNotificationOpen(action);
      }
    }
  };

  const handleMenuClick = (action, fromHeadless) => {
    const diff = Date.now() - menuClickTime;
    if (fromHeadless) {
      setMenuOpen(action);
      setMenuClickTime(Date.now());
    } else {
      if (diff > 250) {
        setMenuOpen(action);
      }
    }
  };

  return (
    <nav className="flex flex-nowrap items-center justify-between py-2 px-4 bg-white shadow-lg sticky top-0 z-10">

        {/* menu slider */}
        <HeadlessSlideOver open={isMenuOpen} setOpen={handleMenuClick}>
          <Menu handleClick={handleMenuClick}></Menu>
        </HeadlessSlideOver>

        {/* notification slider */}
        <HeadlessSlideOver open={isNotificationOpen} setOpen={handleNotificationClick}>
          <Notification handleClick={handleNotificationClick}></Notification>
        </HeadlessSlideOver>

      {/* <div className="flex flex-nowrap"> */}

        {/* Logo */}
        <div className="flex items-center text-2xl lg:text-3xl font-bold text-gray-800">
          <Link href='/' passHref={true}><a>AvaxTrade</a></Link>
        </div>

        {/* Search bar */}
        <div className="flex flex-1 ml-2 items-center input-group relative flex items-stretch w-full">
          <input type="search" className="hidden sm:flex form-control relative flex-auto min-w-0 block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-l-lg transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" placeholder="Search" aria-label="Search" aria-describedby="search"></input>
          <button className="hidden sm:flex btn px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded-r-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex items-center" type="button" id="search">
            <div className="h-5 w-5"><SearchIcon className="w-5 h-5 mr-2" aria-hidden="true" /></div>
          </button>
        </div>

        {/* Right side links */}
        <div className="flex items-center ml-2 gap-2">
          {/* explore */}
          <div className="hidden lg:block ml-2 text-gray-800 font-bold hover:underline">
            <DropDown title="Explore" items={[1,2,3]} getItem={getItem}></DropDown>
          </div>
          {/* trade */}
          <div className="hidden lg:block ml-2 text-gray-800 font-bold hover:underline">
            <DropDown title="Trade" items={[7,8,9]} getItem={getItem}></DropDown>
          </div>
          {/* shopping cart */}
          {/* notification */}
          <div className="ml-2 h-5 w-5 cursor-pointer" onClick={() => handleNotificationClick(true)}>
            {isNotificationOpen == true ?
              <a title="Notification close"><BellIcon className="w-7 h-7 mr-2" aria-hidden="true" /></a> :
              <a title="Notification open"><BellIcon className="w-7 h-7 mr-2" aria-hidden="true" /></a>
            }
            {notificationCount > 0 ?
              <span className="animate-bounce text-white bg-red-700 absolute rounded-full text-xs -mt-2.5 ml-2 py-0 px-1.5">
                {getNotificationCountString()}
              </span>
              :
              <span></span>
            }
          </div>
          {/* avatar */}
          <div className="cursor-pointer ml-2">
            <DropDown title="Avatar" items={[11,12,13]} getItem={getItem} typeImage={true}></DropDown>
          </div>
          {/* menu open */}
          <div className="lg:hidden ml-2 min-w-5 h-5 w-5 cursor-pointer" onClick={() => handleMenuClick(true)}>
            {isMenuOpen == true ?
              <a title="Menu close"><XIcon className="w-5 h-5 mr-2" aria-hidden="true" /></a> :
              <a title="Menu open"><MenuIcon className="w-5 h-5 mr-2" aria-hidden="true" /></a>
            }
          </div>
          
        </div>

      {/* </div> */}

    </nav>
  )
}

export default Navbar