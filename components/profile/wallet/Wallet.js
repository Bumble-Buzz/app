import ContentWrapper from '@/components/wrappers/ContentWrapper';
import { FilterProvider } from '@/contexts/FilterContext';
import WalletContent from '@/components/profile/wallet/WalletContent';
import WalletFilterPanel from '@/components/profile/wallet/WalletFilterPanel';


export default function Wallet({ initialData }) {
  
  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className='flex flex-col sm:flex-row w-full'>
        <FilterProvider>
          <div className="-px-2 -ml-2 bg-white">
            <WalletFilterPanel />
          </div>
          <div className="px-2 bg-white w-full">
            <WalletContent initialData={initialData} />
          </div>
        </FilterProvider>
      </div>
    </ContentWrapper>
  )
}
