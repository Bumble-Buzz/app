import { useReducer, useContext, createContext } from 'react';
import { signOut } from 'next-auth/react';

const AuthContext = createContext();

export const AUTH_CONTEXT_ACTIONS = {
  WALLET: 'wallet-found',
  METAMASK: 'metamask-found',
  CONNECTED: 'connected',
  NETWORK: 'network',
  NETWORK_VERSION: 'network-version',
  ACCOUNT: 'account',
  ALL: 'all'
};

export const useAuth = () => {
  return useContext(AuthContext);
};

const reducer = (state, action) => {
  switch(action.type) {
    case AUTH_CONTEXT_ACTIONS.WALLET:
      signOut({redirect: false});
      return {
        isWalletFound: action.payload.isWalletFound,
        isMetamaskFound: state.isMetamaskFound,
        isConnected: state.isConnected,
        isNetworkValid: state.isNetworkValid,
        networkVersion: state.networkVersion,
        account: state.account
      }
    case AUTH_CONTEXT_ACTIONS.METAMASK:
      signOut({redirect: false});
      return {
        isWalletFound: state.isWalletFound,
        isMetamaskFound: action.payload.isMetamaskFound,
        isConnected: state.isConnected,
        isNetworkValid: state.isNetworkValid,
        networkVersion: state.networkVersion,
        account: state.account
      }
    case AUTH_CONTEXT_ACTIONS.CONNECTED:
      signOut({redirect: false});
      return {
        isWalletFound: state.isWalletFound,
        isMetamaskFound: state.isMetamaskFound,
        isConnected: action.payload.isConnected,
        isNetworkValid: state.isNetworkValid,
        networkVersion: state.networkVersion,
        account: state.account
      }
    case AUTH_CONTEXT_ACTIONS.NETWORK:
      signOut({redirect: false});
      return {
        isWalletFound: state.isWalletFound,
        isMetamaskFound: state.isMetamaskFound,
        isConnected: state.isConnected,
        isNetworkValid: action.payload.isNetworkValid,
        networkVersion: state.networkVersion,
        account: state.account
      }
    case AUTH_CONTEXT_ACTIONS.NETWORK_VERSION:
      signOut({redirect: false});
      return {
        isWalletFound: state.isWalletFound,
        isMetamaskFound: state.isMetamaskFound,
        isConnected: state.isConnected,
        isNetworkValid: state.isNetworkValid,
        networkVersion: action.payload.networkVersion,
        account: state.account
      }
    case AUTH_CONTEXT_ACTIONS.ACCOUNT:
      signOut({redirect: false});
      return {
        isWalletFound: state.isWalletFound,
        isMetamaskFound: state.isMetamaskFound,
        isConnected: state.isConnected,
        isNetworkValid: state.isNetworkValid,
        networkVersion: state.networkVersion,
        account: action.payload.account
      }
    case AUTH_CONTEXT_ACTIONS.ALL:
      return {
        isWalletFound: action.payload.isWalletFound,
        isMetamaskFound: action.payload.isMetamaskFound,
        isConnected: action.payload.isConnected,
        isNetworkValid: action.payload.isNetworkValid,
        networkVersion: action.payload.networkVersion,
        account: action.payload.account
      }
    default:
      return state
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    isWalletFound: false,
    isMetamaskFound: false,
    isConnected: false,
    isNetworkValid: false,
    networkVersion: null,
    account: null
  });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
};
