import { useRouter } from 'next/router';
import ContentWrapper from './wrappers/ContentWrapper';
import Lexicon from '@/lexicon/unauthenticated';


export default function PageError({ children }) {
  const ROUTER = useRouter();
  return (
    <ContentWrapper>
        {/* Page Content */}
        <div className="flex flex-col p-2 w-full">

          {/* display page error */}
          <div className="p-2 flex flex-col items-center text-center">
            <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
              {children}
            </div>
          </div>

        </div>
    </ContentWrapper>
  )
}
