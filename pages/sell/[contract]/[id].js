import { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import Immediate from '@/components/sell/Immediate';
import Auction from '@/components/sell/Auction';
import PageError from '@/components/PageError';
import Unauthenticated from '@/components/Unauthenticated';


export default function Sell({ assetDataInit }) {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  const [tab, setTab] = useState('immediate');
  const [isSaleCreated, setSaleCreated] = useState(false);


  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      AuthContext.state.isNetworkValid
    )
  };
  const isAssetOwner = () => {
    if (!isSignInValid()) return false;
    return (session.user.id === assetDataInit.owner);
  };

  // catch invalids early
  if (!assetDataInit || !assetDataInit.tokenId) return (<PageError>This asset does not exist</PageError>);
  if (!isSignInValid) return (<Unauthenticated link={'/authenticate'}></Unauthenticated>)
  if (!isAssetOwner()) return (<PageError>You are not the owner of this asset</PageError>);

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col p-2 w-full">

        <div className="p-2 flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-800">Sell <span className="text-indigo-600">Asset</span></h2>
        </div>

        {isSaleCreated ?
          <div className="p-2 flex flex-col items-center text-center">
            <div className="">
              <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
                <p className="text-gray-700 text-base mb-4">
                  Your asset has been listed on the marketplace.
                </p>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => ROUTER.push(`/profile/${AuthContext.state.account}`)}
                >
                  See your assets on sale
                </button>
                <br /><br />
                <ButtonWrapper
                  classes=""
                  onClick={() => ROUTER.back()}
                >
                  Return to previous page
                </ButtonWrapper>
              </div>
            </div>
          </div>
          :
          <div className="p-2 flex flex-col items-center gap-2">
            {/* immediate / auction */}
            <div className="px-4 gap-2 flex flex-row flex-wrap items-center text-center">
              {tab === 'immediate' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('general')}>Immediate</button>)
                :
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('immediate')}>Immediate</button>)
              }
              {tab === 'auction' ?
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('wallet')}>Auction</button>)
                :
                (<button className=" flex-1 text-gray-600 py-2 sm:py-4 px-4 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('auction')}>Auction</button>)
              }
            </div>

            {tab === 'immediate' && <Immediate assetDataInit={assetDataInit} setSaleCreated={setSaleCreated} />}
            {tab === 'auction' && <Auction assetDataInit={assetDataInit} setSaleCreated={setSaleCreated} />}

          </div>
        }

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.asset.id(context.query.contract, context.query.id);
  return {
    props: {
      assetDataInit: data.Items[0] || {},
      session: await getSession(context)
    }
  }
}
