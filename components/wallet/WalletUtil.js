import { AUTH_CONTEXT_ACTIONS } from '../../contexts/AuthContext'


const __init__ = async (dispatch) => {
  // register events
  ethereum.on('chainChanged', async (_chainId) => {
    dispatch({
      type: AUTH_CONTEXT_ACTIONS.NETWORK,
      payload: { isNetworkValid: await isNetworkValid() }
    });
    dispatch({
      type: AUTH_CONTEXT_ACTIONS.NETWORK_VERSION,
      payload: { networkVersion: await getNetworkVersion() }
    });
  });
  ethereum.on('accountsChanged', async (_accounts) => {
    // console.log('WalletUtil accounts:', _accounts);
    let currentAccount = null;
    if (_accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (_accounts[0] !== currentAccount) {
      currentAccount = _accounts[0];

      // console.log('WalletUtil current account:', currentAccount);
      dispatch({
        type: AUTH_CONTEXT_ACTIONS.ACCOUNT,
        payload: { account: currentAccount }
      });
    }
  });

}

const _handleChainChanged = async (_chainId) => {
  console.log('new chain:', await getNetworkVersion());
}

const _handleAccountsChanged = async (_accounts) => {
  let currentAccount = null;
  if (_accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (_accounts[0] !== currentAccount) {
    currentAccount = _accounts[0];
    // Do any other work!
  }
  console.log('new account:', currentAccount);
}


const isW3WalletFound = () => {
  return typeof window.ethereum !== 'undefined'
}

const isMetamaskFound = () => {
  return ethereum.isMetaMask;
}

const isConnected = () => {
  return ethereum.isConnected();
}

const getCurrentChain = async () => {
  return await ethereum.request({ method: 'eth_chainId' });
}

const getNetworkVersion = async () => {
  return await ethereum.request({ method: 'net_version' });
}

const isNetworkValid = async () => {
  return await getNetworkVersion() === process.env.NEXT_PUBLIC_CHAIN_ID;
}

const getAccounts = async () => {
  return await ethereum.request({ method: 'eth_accounts' });
}

const reqAccountLogin = async () => {
  return await ethereum.request({ method: 'eth_requestAccounts' });
}


module.exports = {
  __init__,
  isW3WalletFound,
  isMetamaskFound,
  isConnected,
  getCurrentChain,
  getNetworkVersion,
  isNetworkValid,
  getAccounts,
  reqAccountLogin
}
