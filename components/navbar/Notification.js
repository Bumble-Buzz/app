import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


export default function Notification({ children, handleClick }) {
  const ProfileContext = useProfile();

  const removeNotification = (e, notification) => {
    e.preventDefault();

    console.log('removeNotification', notification);
  };

  return (
    <div className="flex flex-col flex-wrap justify-center">

      {ProfileContext && ProfileContext.state && ProfileContext.state.notifications.map((notification, index) => {
        console.log('notification', notification);
        return (
          <div key={index} className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
            <span
              className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer"
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
                <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                {notification.unitPrice}.
              </div>
            </div>
          </div>
        )
      })}

      {/* <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
        <span className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer">X</span>
        <p className="text-gray-700 text-base">
          You have received a new bid on NFT SALE TITLE sale.
        </p>
      </div>
      <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
        <span className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer">X</span>
        <p className="text-gray-700 text-base">
          You have received a new bid on NFT SALE TITLE sale.
        </p>
      </div> */}

      <ButtonWrapper className="mt-4 focus:outline-none" onClick={() => handleClick(false)}>Notification Close</ButtonWrapper>

    </div>
  );
}
