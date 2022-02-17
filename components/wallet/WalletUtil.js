import { ethers } from 'ethers';
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
    let currentAccount = null;
    if (_accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
    } else if (_accounts[0] !== currentAccount) {
      currentAccount = ethers.utils.getAddress(_accounts[0]);

      dispatch({
        type: AUTH_CONTEXT_ACTIONS.ACCOUNT,
        payload: { account: currentAccount }
      });
    }
  });

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

const isWalletGood = () => {
  return (isW3WalletFound() && isMetamaskFound() && isConnected());
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

const getAccount = async () => {
  const accounts = await ethereum.request({ method: 'eth_accounts' });
  const firstAccount = accounts[0];
  return ethers.utils.getAddress(firstAccount);
}

const reqAccountLogin = async () => {
  return await ethereum.request({ method: 'eth_requestAccounts' });
}

const getWalletProvider = async () => {
  if (isWalletGood()) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    return null;
  }
}
const getWalletSigner = async () => {
  const provider = await getWalletProvider();
  if (provider) {
    return provider.getSigner();
  } else {
    return null;
  }
}

const checkTransaction = async (transaction) => {
  const provider = await getWalletProvider();
  if (provider) {
    return await provider.getTransactionReceipt(transaction.hash);
  } else {
    return null;
  }
};


module.exports = {
  __init__,
  isW3WalletFound,
  isMetamaskFound,
  isConnected,
  isWalletGood,
  getCurrentChain,
  getNetworkVersion,
  isNetworkValid,
  getAccount,
  reqAccountLogin,
  getWalletProvider,
  getWalletSigner,
  checkTransaction
}
