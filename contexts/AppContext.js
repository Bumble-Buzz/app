import { WalletProvider } from '@/contexts/WalletContext';
import { ProfileProvider } from '@/contexts/ProfileContext';

export default function AppContext({ children }) {

  return (
    <>
      <WalletProvider>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </WalletProvider>
    </>
  )
};
