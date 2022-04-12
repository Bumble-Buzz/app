import ContentWrapper from '@/components/wrappers/ContentWrapper';
import { FilterProvider } from '@/contexts/FilterContext';
import ListingsContent from '@/components/profile/listings/ListingsContent';
import ListingsFilterPanel from '@/components/profile/listings/ListingsFilterPanel';


export default function Listings({ initialData }) {
  
  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className='flex flex-col sm:flex-row w-full'>
        <FilterProvider>
          <div className="-px-2 -ml-2 bg-white">
            <ListingsFilterPanel />
          </div>
          <div className="px-2 bg-white w-full">
            <ListingsContent initialData={initialData} />
          </div>
        </FilterProvider>
      </div>
    </ContentWrapper>
  )
}
