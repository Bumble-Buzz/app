
import { useEffect, useState } from 'react';
import { OverlayProvider, usePreventScroll } from 'react-aria';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import WALLTET from '../utils/wallet';

import Button from './Button';
import HeadlessSlideOver from './HeadlessSlideOver';
import Menu from './Menu';
import DropDown from './DropDown';

import {ChevronRightIcon, ChevronLeftIcon, PencilIcon} from '@heroicons/react/solid';
import {
  ChevronDownIcon as ChevronDownIconOutline,
  PencilIcon as PencilIconOutline
} from '@heroicons/react/outline';

import { config, library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBars, faTimes, faBell, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;
library.add(faSearch, faBars, faTimes, faBell, faShoppingCart);

function Navbar() {
  const ROUTER = useRouter();

  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notificationClickTime, setNotificationClickTime] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [menuClickTime, setMenuClickTime] = useState(0);

  const [activeMenu, setActiveMenu] = useState('main');

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

  const exploreItems = () => {
    const asd = [];
    const inner = {};
    inner.icon;
    inner.label;
    return asd;
  };

  const renderItem = () => {
    return (
      <PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />
    );
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
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 7:
        return {
          label: 'Create',
          link: '/',
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
    // if (e) {
    //   e.preventDefault();
    // }
    const diff = Date.now() - notificationClickTime;
    if (fromHeadless) {
      setNotificationOpen(action);
      setNotificationClickTime(Date.now());
    } else {
      // console.log('diff', diff);
      if (diff > 250) {
        setNotificationOpen(action);
      }
    }
  };

  const handleMenuClick = (action, fromHeadless) => {
    const diff = Date.now() - menuClickTime;
    if (fromHeadless) {
      if (action) { setActiveMenu('main'); }
      setMenuOpen(action);
      setMenuClickTime(Date.now());
    } else {
      // console.log('diff', diff);
      if (diff > 250) {
        if (action) { setActiveMenu('main'); }
        setMenuOpen(action);
      }
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    setNavOpen(true);
  };

  const handleClickCloseNav = (e) => {
    e.preventDefault();
    setNavOpen(false);
  };

  const navContentBgLayer = () => {
    if (isNavOpen) {
      return (
        <button
          onClick={handleClickCloseNav}
          tabIndex="-1"
          className="fixed inset-0 h-full w-full bg-black opacity-30 cursor-default">
        </button>
      )
    }
  }

  const navContent = () => {
    if (isNavOpen) {
      return (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl">
          <Link href='/'>
            {ROUTER.pathname == '/' ?
              <a className="block px-4 py-2 my-1 text-gray-100 bg-gray-900 font-medium">Dashboard</a> :
              <a className="block px-4 py-2 my-1 text-gray-800 hover:bg-gray-900 hover:text-gray-100 hover:font-medium">Dashboard</a>
            }
          </Link>
          <Link href='/my-nft'>
            {ROUTER.pathname == '/my-nft' ?
              <a className="block px-4 py-2 my-1 text-gray-100 bg-gray-900 font-medium">My Wallet</a> :
              <a className="block px-4 py-2 my-1 text-gray-800 hover:bg-gray-900 hover:text-gray-100 hover:font-medium">My Wallet</a>
            }
          </Link>
          <Link href='/analytic'>
            {ROUTER.pathname == '/analytic' ?
              <a className="block px-4 py-2 my-1 text-gray-100 bg-gray-900 font-medium">Analytics</a> :
              <a className="block px-4 py-2 my-1 text-gray-800 hover:bg-gray-900 hover:text-gray-100 hover:font-medium">Analytics</a>
            }
          </Link>
          <Link href='/docs'>
            {ROUTER.pathname == '/docs' ?
              <a className="block px-4 py-2 my-1 text-gray-100 bg-gray-900 font-medium">Docs</a> :
              <a className="block px-4 py-2 my-1 text-gray-800 hover:bg-gray-900 hover:text-gray-100 hover:font-medium">Docs</a>
            }
          </Link>
          <Link href='#'>
            <a onClick={connectWallet} className="block px-4 py-2 bg-gray-600 text-white hover:bg-gray-800 transition duration-200 each-in-out">{walletState.displayString}</a>
          </Link>
        </div>
      )
    }
  };

  const notificationContent = () => {
    return (
      <HeadlessSlideOver open={isNotificationOpen} setOpen={handleNotificationClick} title="Item Details">
        <div className="flex flex-wrap justify-center">

          <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
            <span className="text-white bg-red-700 absolute right-0 rounded-full text-xs -mt-2.5 px-1.5">X</span>
            <p className="text-gray-700 text-base">
              You have received a new bid on "NFT SALE TITLE" sale.
            </p>
          </div>
          <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
            <span className="text-white bg-red-700 absolute right-0 rounded-full text-xs -mt-2.5 px-1.5">X</span>
            <p className="text-gray-700 text-base">
              You have received a new bid on "NFT SALE TITLE" sale.
            </p>
          </div>
          <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
            <span className="text-white bg-red-700 absolute right-0 rounded-full text-xs -mt-2.5 px-1.5">X</span>
            <p className="text-gray-700 text-base">
              You have received a new bid on "NFT SALE TITLE" sale.
            </p>
          </div>

          <Button className="mt-4" onClick={() => handleNotificationClick(false)}>Notification Close</Button>
        </div>
      </HeadlessSlideOver>
    )
  };

  return (
    <nav className="items-center justify-between py-2 px-8 md:px-6 bg-white shadow-lg sticky top-0 z-10">
      <OverlayProvider>

        {/* menu slider */}
        <HeadlessSlideOver open={isMenuOpen} setOpen={handleMenuClick} title="Item Details">
          <Menu handleClick={handleMenuClick}></Menu>
        </HeadlessSlideOver>

        {notificationContent()}

      <div className="flex flex-nowrap">

        {/* Logo */}
        <div className="flex items-center ml-2 text-1xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          <Link href='/' passHref={true}><a>AvaxTrade</a></Link>
        </div>

        {/* Search bar */}
        <div className="flex flex-1 ml-2 items-center input-group relative flex items-stretch w-full">
          <input type="search" className="hidden sm:flex form-control relative flex-auto min-w-0 block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-l-lg transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" placeholder="Search" aria-label="Search" aria-describedby="search"></input>
          <button className="hidden sm:flex btn px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded-r-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex items-center" type="button" id="search">
            <div className="h-5 w-5"><FontAwesomeIcon icon={['fas', 'search']} /></div>
          </button>
        </div>

        {/* Right side links */}
        <div className="flex items-center ml-2 gap-2">
          {/* explore */}
          <div className="hidden md:block ml-2 text-gray-800 font-bold hover:underline">
            {/* <Link href='/' passHref={true}><a title="Explore">Explore</a></Link> */}
            <DropDown title="Explore" items={[1,2,3]} getItem={getItem}></DropDown>
          </div>
          {/* trade */}
          <div className="hidden md:block ml-2 text-gray-800 font-bold hover:underline">
            {/* <Link href='/' passHref={true}><a title="Trade">Trade</a></Link> */}
            <DropDown title="Trade" items={[7,8,9]} getItem={getItem}></DropDown>
          </div>
          {/* shopping cart */}
          {/* <div className="ml-2 h-5 w-5">
            <Link href='/' passHref={true}>
              <a target="_blank" title="Cart"><FontAwesomeIcon icon={['fas', 'shopping-cart']} /></a>
            </Link>
          </div> */}
          {/* notification */}
          <div className="ml-2 h-5 w-5 cursor-pointer" onClick={() => handleNotificationClick(true)}>
            {isNotificationOpen == true ?
              <a title="Notification close"><FontAwesomeIcon icon={['fas', 'bell']} /></a> :
              <a title="Notification open"><FontAwesomeIcon icon={['fas', 'bell']} /></a>
            }
            {notificationCount > 0 ?
              <span className="text-white bg-red-700 absolute rounded-full text-xs -mt-2.5 ml-2 py-0 px-1.5">{getNotificationCountString()}</span>
              :
              <span></span>
            }
          </div>
          {/* avatar */}
          <div className="cursor-pointer ml-2">
            {/* <Link href='/' passHref={true}>
              <img className="object-cover w-10 h-10 border-2 border-black-600 rounded-full"
                src={'/avocado.jpg'} alt="Profile" title="Account" />
            </Link> */}
            <DropDown title="Avatar" items={[11,12,13]} getItem={getItem} typeImage={true}></DropDown>
          </div>
          {/* menu open */}
          <div className="md:hidden ml-2 min-w-5 h-5 w-5 cursor-pointer" onClick={() => handleMenuClick(true)}>
            {isMenuOpen == true ?
              <a title="Menu close"><FontAwesomeIcon icon={['fas', 'times']} /></a> :
              <a title="Menu open"><FontAwesomeIcon icon={['fas', 'bars']} /></a>
            }
          </div>
          
        </div>

      </div>


              

</OverlayProvider>
    </nav>
  )
}

export default Navbar