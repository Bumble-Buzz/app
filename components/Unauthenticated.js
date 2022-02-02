import { useRouter } from 'next/router';
import ContentWrapper from './ContentWrapper';


export default function Unauthenticated({ link }) {
  const ROUTER = useRouter();
  return (
    <ContentWrapper>
        {/* Page Content */}
        <div className="flex flex-col p-2 w-full">

          {/* not authenticated */}
          <div className="p-2 flex flex-col items-center text-center">
            <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
              <p className="text-gray-700 text-base mb-4">
                You are not authenticated
              </p> 
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => ROUTER.push(link)}
              >
                Authenticate
              </button>
            </div>
          </div>

        </div>
    </ContentWrapper>
  )
}
