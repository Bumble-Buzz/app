
import { useEffect, useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import WALLTET from '../utils/wallet';

function Navbar() {
  const ROUTER = useRouter();
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

  return (
    <nav className="bg-white shadow-lg" onMouseEnter={handleClickCloseNav} onMouseLeave={handleClickCloseNav}>
      <div className="md:flex items-center justify-between py-2 px-8 md:px-12">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800 md:text-3xl">
            <Link href='/'><a>AvaxTrade</a></Link>
          </div>
          <div onMouseEnter={handleClick} className="relative z-10 md:hidden">
            <button type="button" className="relative block text-gray-800 hover:text-gray-700 focus:text-gray-700 focus:outline-none">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path className="hidden" d="M16.24 14.83a1 1 0 0 1-1.41 1.41L12 13.41l-2.83 2.83a1 1 0 0 1-1.41-1.41L10.59 12 7.76 9.17a1 1 0 0 1 1.41-1.41L12 10.59l2.83-2.83a1 1 0 0 1 1.41 1.41L13.41 12l2.83 2.83z"/>
                <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
              </svg>
            </button>
            {/* {navContentBgLayer()} */}
            {navContent()}
          </div>
        </div>
        <div className="flex flex-col md:flex-row hidden md:block -mx-2">
          <Link href='/'>
            {ROUTER.pathname == '/' ?
              <a className="text-gray-100 bg-gray-900 font-medium rounded py-2 px-2 md:mx-2">Dashboard</a> :
              <a className="text-gray-800 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium py-2 px-2 md:mx-2">Dashboard</a>
            }
          </Link>
          <Link href='/my-nft'>
            {ROUTER.pathname == '/my-nft' ?
              <a className="text-gray-100 bg-gray-900 font-medium rounded py-2 px-2 md:mx-2">My Wallet</a> :
              <a className="text-gray-800 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium py-2 px-2 md:mx-2">My Wallet</a>
            }
          </Link>
          <Link href='/analytic'>
            {ROUTER.pathname == '/analytic' ?
              <a className="text-gray-100 bg-gray-900 font-medium rounded py-2 px-2 md:mx-2">Analytics</a> :
              <a className="text-gray-800 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium py-2 px-2 md:mx-2">Analytics</a>
            }
          </Link>
          <Link href='/docs'>
            {ROUTER.pathname == '/docs' ?
              <a className="text-gray-100 bg-gray-900 font-medium rounded py-2 px-2 md:mx-2">Docs</a> :
              <a className="text-gray-800 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium py-2 px-2 md:mx-2">Docs</a>
            }
          </Link>
          <Link href='/'>
            <button onClick={connectWallet} className="w-28 mx-2 px-2 py-2 bg-gray-600 text-white text-xs font-semibold rounded hover:bg-gray-800 transition duration-200 each-in-out">{walletState.displayString}</button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar