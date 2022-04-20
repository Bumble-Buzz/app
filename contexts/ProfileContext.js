import { useReducer, useContext, createContext } from 'react';

const ProfileContext = createContext();

export const PROFILE_CONTEXT_ACTIONS = {
  WALLET_ID: 'wallet-id',
  NAME: 'name',
  BIO: 'bio',
  NOTIFICATIONS: 'notifications',
  PICTURE: 'picture',
  TIMESTAMP: 'timestamp',
  ALL: 'all',
  ALL_DATA: 'all-data',
  CLEAR: 'clear'
};

export const useProfile = () => {
  return useContext(ProfileContext);
};

const reducer = (state, action) => {
  let newState;
  switch(action.type) {
    case PROFILE_CONTEXT_ACTIONS.WALLET_ID:
      // newState = JSON.parse(JSON.stringify(state));
      // newState.walletId = action.payload.walletId;
      // when updating wallet id, make sure to clear other fields
      return {
        walletId: action.payload.walletId,
        name: null,
        bio: null,
        notifications: [],
        picture: null,
        timestamp: null
      }
      // return newState
    case PROFILE_CONTEXT_ACTIONS.NAME:
      newState = JSON.parse(JSON.stringify(state));
      newState.name = action.payload.name;
      return newState
    case PROFILE_CONTEXT_ACTIONS.BIO:
      newState = JSON.parse(JSON.stringify(state));
      newState.bio = action.payload.bio;
      return newState
    case PROFILE_CONTEXT_ACTIONS.NOTIFICATIONS:
      newState = JSON.parse(JSON.stringify(state));
      newState.notifications = action.payload.notifications;
      return newState
    case PROFILE_CONTEXT_ACTIONS.PICTURE:
      newState = JSON.parse(JSON.stringify(state));
      newState.picture = action.payload.picture;
      return newState
    case PROFILE_CONTEXT_ACTIONS.TIMESTAMP:
      newState = JSON.parse(JSON.stringify(state));
      newState.timestamp = action.payload.timestamp;
      return newState
    case PROFILE_CONTEXT_ACTIONS.ALL:
      return {
        walletId: action.payload.walletId,
        name: action.payload.name,
        bio: action.payload.bio,
        notifications: action.payload.notifications,
        picture: action.payload.picture,
        timestamp: action.payload.timestamp
      }
    case PROFILE_CONTEXT_ACTIONS.ALL_DATA:
      return {
        name: action.payload.name,
        bio: action.payload.bio,
        notifications: action.payload.notifications,
        picture: action.payload.picture,
        timestamp: action.payload.timestamp
      }
    case PROFILE_CONTEXT_ACTIONS.CLEAR:
      return {
        walletId: null,
        name: null,
        bio: null,
        notifications: [],
        picture: null,
        timestamp: null
      }
    default:
      return state
  }
};

export const ProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    walletId: null,
    name: null,
    bio: null,
    notifications: [],
    picture: null,
    timestamp: null
  });

  return (
    <ProfileContext.Provider value={{ state, dispatch }}>
      {children}
    </ProfileContext.Provider>
  )
};
