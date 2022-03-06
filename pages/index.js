import { useRouter } from 'next/router';
import Image from 'next/image';
import ContentWrapper from '../components/wrappers/ContentWrapper';
import Lexicon from '../lexicon/index';
import Tooltip from '../components/Tooltip';


export default function Home() {
  const ROUTER = useRouter();

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-wrap px-8 md:px-12 items-center text-center">

        <div className="lg:text-left lg:w-1/2">
          <div className="flex flex-col">
            <div className="my-2">
              <h2 className="text-3xl font-semibold text-gray-800 md:text-4xl">
                {Lexicon.titleText} <span className="text-indigo-600">{Lexicon.titleText2}</span>
              </h2>
            </div>
            <div className="my-2">
              <p className="mt-2 text-sm text-gray-500 md:text-base">{Lexicon.description}</p>
            </div>
            <div className="my-2">
              <div className="flex flex-row flex-wrap justify-center">
                <div>
                  <Tooltip text='Explore NFTs and Collections'>
                    <button className="my-1 mx-4 px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800" href="#">Explore</button>
                  </Tooltip>
                </div>
                <div>
                  <button className="my-1 mx-4 px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800" href="#">Sell</button>
                </div>
                <div>
                  <button onClick={() => {ROUTER.push('/asset/create')}} className="my-1 mx-4 px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800" href="#">Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2" style={{clipPath: 'polygon(10% 0, 100% 0%, 100% 100%, 0 100%)'}}>
          {/* <div className="h-full object-cover" style={{backgroundImage: 'url(/avocado.jpg)'}}>
            <div className="h-full bg-black opacity-25"></div>
          </div> */}
          <Image src={'/avocado.jpg'} alt='avocado' width='612' height='473' />
        </div>

      </div>
    </ContentWrapper>
  )
}
