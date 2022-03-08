
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/react';
import Menu from './Menu';
import Notification from './Notification';
import DropDown from './DropDown';
import HeadlessSlideOver from '../HeadlessSlideOver';
import { useAuth, AUTH_CONTEXT_ACTIONS } from '../../contexts/AuthContext';
import WalletUtil from '../../components/wallet/WalletUtil';
import Lexicon from '../../lexicon/navbar';
import {
  PencilIcon, SearchIcon, MenuIcon, XIcon, BellIcon, ShoppingCartIcon
} from '@heroicons/react/solid';
import {
  PencilIcon as PencilIconOutline
} from '@heroicons/react/outline';


export default function Navbar() {
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  // console.log('session', session, sessionStatus);

  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notificationClickTime, setNotificationClickTime] = useState(0);
  const [notificationCount, setNotificationCount] = useState(1);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [menuClickTime, setMenuClickTime] = useState(0);

  useEffect(() => {
    walletInit();
  }, []);

  const walletInit = async () => {
    await WalletUtil.__init__(AuthContext.dispatch);

    AuthContext.dispatch({
      type: AUTH_CONTEXT_ACTIONS.ALL,
      payload: {
        isWalletFound: WalletUtil.isW3WalletFound(),
        isMetamaskFound: WalletUtil.isMetamaskFound(),
        isConnected: WalletUtil.isConnected(),
        isNetworkValid: await WalletUtil.isNetworkValid(),
        networkVersion: await WalletUtil.getNetworkVersion(),
        account: await WalletUtil.getAccount()
      }
    });
  };

  const getItem = (itemId) => {
    switch(itemId) {
      case 1:
        return {
          label: (Lexicon.explore.allNfts),
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 2:
        return {
          label: (Lexicon.explore.allCollections),
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 3:
        return {
          label: (Lexicon.explore.categoriesBelow),
          link: '/docs',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 7:
        return {
          label: (Lexicon.trade.create),
          link: '/asset/create',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 8:
        return {
          label: (Lexicon.trade.sell),
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 9:
        return {
          label: (Lexicon.trade.transfer),
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 11:
        return {
          label: (Lexicon.avatar.profile),
          link: `/profile/${AuthContext.state.account}`,
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 12:
        return {
          label: (Lexicon.avatar.myCollections),
          link: `/profile/${AuthContext.state.account}?tab=collections`,
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 13:
        return {
          label: (Lexicon.avatar.preferences),
          link: '/',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 14:
        return {
          label: (Lexicon.avatar.signIn),
          link: '/authenticate',
          icon: (<PencilIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<PencilIconOutline className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 15:
        return {
          label: (Lexicon.avatar.signOut),
          link: '/authenticate',
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

      {/* Logo */}
      <div className="flex items-center text-2xl lg:text-3xl font-bold text-gray-800">
        <Link href='/' passHref={true}><a>{Lexicon.title}</a></Link>
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
          <DropDown title={Lexicon.explore.text} items={[1,2,3]} getItem={getItem}></DropDown>
        </div>
        {/* trade */}
        <div className="hidden lg:block ml-2 text-gray-800 font-bold hover:underline">
          <DropDown title={Lexicon.trade.text} items={[7,8,9]} getItem={getItem}></DropDown>
        </div>
        {/* shopping cart */}
        {/* notification */}
        <div className="ml-2 h-5 w-5 cursor-pointer" onClick={() => handleNotificationClick(true)}>
          {isNotificationOpen == true ?
            <a title={Lexicon.notification.close}><BellIcon className="w-7 h-7 mr-2" aria-hidden="true" /></a> :
            <a title={Lexicon.notification.open}><BellIcon className="w-7 h-7 mr-2" aria-hidden="true" /></a>
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
          {session && sessionStatus === 'authenticated' ?
            (<DropDown title={Lexicon.avatar.text} items={[11,12,13,15]} getItem={getItem} isImage={true}></DropDown>)
            :
            (<DropDown title={Lexicon.avatar.text} items={[11,12,13,14]} getItem={getItem} isImage={true}></DropDown>)
          }
        </div>
        {/* menu open */}
        <div className="lg:hidden ml-2 min-w-5 h-5 w-5 cursor-pointer" onClick={() => handleMenuClick(true)}>
          {isMenuOpen == true ?
            <a title={Lexicon.menu.close}><XIcon className="w-5 h-5 mr-2" aria-hidden="true" /></a> :
            <a title={Lexicon.menu.open}><MenuIcon className="w-5 h-5 mr-2" aria-hidden="true" /></a>
          }
        </div>
      </div>

    </nav>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
