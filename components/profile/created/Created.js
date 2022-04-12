import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import { FilterProvider } from '@/contexts/FilterContext';
import CreatedContent from '@/components/profile/created/CreatedContent';
import CreatedFilterPanel from '@/components/profile/created/CreatedFilterPanel';
import { ArrowRightIcon } from '@heroicons/react/solid';


export default function Created({ initialData }) {
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();
  const ROUTER = useRouter();

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      AuthContext.state.isNetworkValid
    )
  };
  const isProfileOwner = () => {
    return (session.user.id === ROUTER.query.wallet)
  };
  
  return (
    <ContentWrapper>
      <div className='flex flex-col flex-nowrap gap-2 w-full'>
        {/* create button */}
        {isSignInValid() && isProfileOwner() && (
          <div className='py-2 flex flex-nowrap gap-2 justify-start items-center'>
            <ButtonWrapper
              classes="py-2 px-4 border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
              onClick={() => ROUTER.push('/asset/create')}
            >
              Create new NFT
              <ArrowRightIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
            </ButtonWrapper>
          </div>
        )}
        {/* Page Content */}
        <div className='flex flex-col sm:flex-row w-full'>
          <FilterProvider>
            <div className="-px-2 -ml-2 bg-white">
              <CreatedFilterPanel />
            </div>
            <div className="px-2 bg-white w-full">
              <CreatedContent initialData={initialData} />
            </div>
          </FilterProvider>
        </div>
      </div>
    </ContentWrapper>
  )
}
