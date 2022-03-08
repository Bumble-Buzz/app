import { useEffect, useState } from 'react';

import HeadlessDialog from '@/components/HeadlessDialog';
import WALLTET from '@/utils/wallet';

export default function WalletModal({ children, open, setOpen, title, content }) {
  // const [isError, setError] = useState(false);
  // const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // if (isError) {
    //   handleDialogClick(true);
    // }
  }, []);

  const handleError = (action) => {
    setError(action);
  };

  const handleDialogClick = (action) => {
    setDialogOpen(action);
  };

  const isW3WalletFound = () => {
    return typeof ethereum !== 'undefined';
  }

  const isMetamaskFound = () => {
    return ethereum.isMetaMask;
  }

  const isNetworkValid = () => {
    return ethereum.networkVersion === process.env.NEXT_PUBLIC_CHAIN_ID;
  }

  return (
    <HeadlessDialog
      open={open}
      setOpen={setOpen}
      title='Invalid network'
      content='Invalid network'
    >
      {children}
    </HeadlessDialog>
  )

  // let modalTitle;
  // let modalContent;
  // if (!isW3WalletFound()) {
  //   modalTitle = 'No W3 wallet found';
  //   modalContent = 'No W3 wallet found';
  // } else if (!isMetamaskFound()) {
  //   modalTitle = 'No Metamask found';
  //   modalContent = 'No Metamask found';
  // } else if (!isNetworkValid()) {
  //   modalTitle = 'Invalid network';
  //   modalContent = 'Invalid network';
  // }

  // if (modalTitle && modalContent) {
  //   console.log('asd');
  //   // handleError(true);
  //   return (
  //     <HeadlessDialog
  //       open={isDialogOpen}
  //       setOpen={handleDialogClick}
  //       setError={handleError}
  //       title='Invalid network'
  //       content='Invalid network'
  //     >
  //     </HeadlessDialog>
  //   )
  // } else {
  //   return (
  //     <></>
  //   )
  // }

  // if (isW3WalletFound()) {
  //   if (isMetamaskFound()) {
  //     if (isNetworkValid()) {
  //       console.log('valid network');
  //       return (
  //         <></>
  //       )
  //     } else {
  //       handleError(true);
  //       return (
  //       <HeadlessDialog
  //         open={isDialogOpen}
  //         setOpen={handleDialogClick}
  //         setError={handleError}
  //         title='Invalid network'
  //         content='Invalid network'
  //       >
  //       </HeadlessDialog>
  //       )
  //     }
  //   }
  //   else {
  //     return (
  //     <HeadlessDialog
  //       open={isDialogOpen}
  //       setOpen={handleDialogClick}
  //       setError={handleError}
  //       title='No Metamask found'
  //       content='No Metamask found'
  //     >
  //     </HeadlessDialog>
  //     )
  //   }
  // } else {
  //   return (
  //     <HeadlessDialog
  //       open={isDialogOpen}
  //       setOpen={handleDialogClick}
  //       setError={handleError}
  //       title='No W3 wallet found'
  //       content='No W3 wallet found'
  //     >
  //     </HeadlessDialog>
  //   )
  // }




  // if (typeof ethereum === 'undefined') {
  //   return (
  //     <>
  //       <HeadlessDialog open={isDialogOpen} setOpen={handleDialogClick} title='No W3 wallet found'>
  //       </HeadlessDialog>
  //     </>
  //   )
  // } else if (ethereum.isMetaMask) {
  //   console.log('isError', isError);
  //   console.log('ethereum.networkVersion', ethereum.networkVersion);
  //   console.log('ethereum.selectedAddress', ethereum.selectedAddress);
  //   return (
  //     <>
  //       <HeadlessDialog
  //         open={isDialogOpen}
  //         setOpen={handleDialogClick}
  //         setError={handleError}
  //         title='Metamask W3 wallet found'
  //         content='THIS IS CONTENT'
  //       >
  //       </HeadlessDialog>
  //     </>
  //   )
  // } else {
  //   return (
  //     <></>
  //   )
  // }
  
}
