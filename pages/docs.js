import { useState } from 'react'
import Content from '@/components/docs/content';

export default function Docs() {
  const [activeTab, setActiveTab] = useState(1);

  const handleClick = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <main className="flex flex-nowrap flex-col items-center px-0 py-1 w-full">
      <div className="flex flex-nowrap rounded shadow-lg w-full" style={{minHeight: '500px'}}>

        {/* Page Content */}
        <div className="flex flex-col p-2 w-full">

          <div className="p-2 md:p-4">
            <h2 className="text-3xl font-semibold text-gray-800 md:text-4xl">AvaxTrade <span className="text-indigo-600">Docs</span></h2>
          </div>
          <div className="p-2 md:p-4">
            <div className="flex flex-row">
              <div className="mr-1 md:mr-4 border-r-2">
                <div className="mt-2 py-2 w-26 md:w-32 bg-gray">
                  <a
                    onClick={(e) => handleClick(e, 1)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      AvaxTrade
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 2)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      Tokenomics
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 0)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      Rarity
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 0)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      Marketplace
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 0)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      Honorary
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 0)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      Roadmap
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 0)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      FAQ
                  </a>
                  <a
                    onClick={(e) => handleClick(e, 3)}
                    className="block px-1 md:px-4 py-2 text-grey-800 hover:bg-gray-500 hover:text-gray-100 hover:font-medium cursor-pointer">
                      Team
                  </a>
                </div>
              </div>
              <div className="pl-1 md:pl-4">
                {<Content id={activeTab} />}
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
  