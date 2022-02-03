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
  let newState;
  switch(action.type) {
    case AUTH_CONTEXT_ACTIONS.WALLET:
      signOut({redirect: false});
      newState = JSON.parse(JSON.stringify(state));
      newState.isWalletFound = action.payload.isWalletFound;
      return newState
    case AUTH_CONTEXT_ACTIONS.METAMASK:
      signOut({redirect: false});
      newState = JSON.parse(JSON.stringify(state));
      newState.isMetamaskFound = action.payload.isMetamaskFound;
      return newState
    case AUTH_CONTEXT_ACTIONS.CONNECTED:
      signOut({redirect: false});
      newState = JSON.parse(JSON.stringify(state));
      newState.isConnected = action.payload.isConnected;
      return newState
    case AUTH_CONTEXT_ACTIONS.NETWORK:
      signOut({redirect: false});
      newState = JSON.parse(JSON.stringify(state));
      newState.isNetworkValid = action.payload.isNetworkValid;
      return newState
    case AUTH_CONTEXT_ACTIONS.NETWORK_VERSION:
      signOut({redirect: false});
      newState = JSON.parse(JSON.stringify(state));
      newState.networkVersion = action.payload.networkVersion;
      return newState
    case AUTH_CONTEXT_ACTIONS.ACCOUNT:
      signOut({redirect: false});
      newState = JSON.parse(JSON.stringify(state));
      newState.account = action.payload.account;
      return newState
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
