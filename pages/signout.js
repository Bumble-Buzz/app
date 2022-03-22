import { useRouter } from 'next/router';
import { getSession, signOut } from 'next-auth/react';
import ContentWrapper from '@/components/wrappers/ContentWrapper';


export default function SignIn() {
  const ROUTER = useRouter();

  const handleSignOut = async () => {
    signOut({redirect: false});
    ROUTER.back();
  };

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col p-2 w-full">

        <div className="p-2 flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-800">Sign<span className="text-indigo-600">Out</span></h2>
        </div>

        <div className="p-2 flex flex-col items-center text-center">
          <div className="block p-6 rounded-lg shadow-lg bg-white">
            <p className="text-gray-700 text-base mb-4">
              Would you like to sign out?
            </p>
            <button
              type="button"
              className="inline-flex justify-center mx-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => ROUTER.back()}
            >
              Back
            </button>
            <button
              type="button"
              className="inline-flex justify-center mx-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
