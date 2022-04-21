import { useState } from 'react';
import { useProfile, PROFILE_CONTEXT_ACTIONS } from '@/contexts/ProfileContext';
import { useSession } from 'next-auth/react';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import ENUM from '@/enum/ENUM';


export default function Notification({ children, handleClick }) {
  const ProfileContext = useProfile();
  const { data: session, status: sessionStatus } = useSession();

  const removeNotification = async (e, _notification) => {
    e.preventDefault();

    const newNotifications = ProfileContext.state.notifications.filter(
      notification => notification.tokenId !== _notification.tokenId
    );

    ProfileContext.dispatch({
      type: PROFILE_CONTEXT_ACTIONS.NOTIFICATIONS,
      payload: { notifications: newNotifications }
    });

    const payload = {
      'walletId': session.user.id,
      'notifications': newNotifications
    };
    await API.user.update.myNotifications(payload);
  };

  const removeAllNotifications = async (e) => {
    e.preventDefault();

    ProfileContext.dispatch({
      type: PROFILE_CONTEXT_ACTIONS.NOTIFICATIONS,
      payload: { notifications: [] }
    });

    const payload = {
      'walletId': session.user.id,
      'notifications': []
    };
    await API.user.update.myNotifications(payload);
  };


  return (
    <div className="flex flex-col flex-nowrap gap-4 justify-start [height:calc(100vh-6rem)] h-fit">

      {/* If no notifications exist, display message */}
      {(!ProfileContext || !ProfileContext.state || !ProfileContext.state || ProfileContext.state.notifications.length === 0) && (
        <div className="flex flex-row flex-wrap gap-x-1 justify-center text-gray-700 text-base">
          No notifications found
        </div>
      )}

      {/* if notifications exist, display count */}
      {(ProfileContext && ProfileContext.state && ProfileContext.state && ProfileContext.state.notifications.length > 0) && (
        <div className="p-2 flex flex-row flex-wrap gap-x-1 text-gray-700 text-base w-full">
          Notifications: {ProfileContext.state.notifications.length}
        </div>
      )}

      {/* if notifications exist, iterate through them and create visual components */}
      {ProfileContext && ProfileContext.state && ProfileContext.state.notifications.map((notification, index) => {
        return (
          <div key={index} className="block p-2 m-2 rounded-lg shadow-lg bg-white max-w-sm relative">
            <span
              className="-mx-1 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer"
              onClick={(e) => removeNotification(e, notification)}
            >
              X
            </span>
            <div className="flex flex-row flex-wrap gap-x-1 text-gray-700 text-base">
              <div>Asset</div>
              <div>
                {notification.assetName && (<LinkWrapper
                  classes='focus:outline-none'
                  onClick={() => handleClick(false)}
                  link={`/asset/${notification.contractAddress}/${notification.tokenId}`}
                  linkText={notification.assetName}
                />)}
              </div>
              <div>has been sold for</div>
              <div className='flex flex-row flex-nowrap justify-center items-center'>
                <div className="relative h-5 w-5">{ENUM.CHAIN_ICONS.ethereum}</div>
                {notification.unitPrice}.
              </div>
            </div>
          </div>
        )
      })}

      {/* if notifications exist, show a clear all button */}
      {(ProfileContext && ProfileContext.state && ProfileContext.state && ProfileContext.state.notifications.length > 0) && (
        <div className="p-2 flex flex-col flex-nowrap w-full">
          <ButtonWrapper classes="bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-0" onClick={removeAllNotifications}>Clear All</ButtonWrapper>
        </div>
      )}

      {/* show a button to close the notification panel */}
      <div className='p-2 flex flex-col flex-nowrap w-full sticky top-[100vh]'>
        <ButtonWrapper classes="bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-0" onClick={() => handleClick(false)}>Notification Close</ButtonWrapper>
      </div>

    </div>
  );
}
