import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import AdminFactory from './AdminFactory';


export default function Admin() {
  const [tab, setTab] = useState('general');

  return (
    <>
      <div className="p-1 rounded-lg shadow-lg bg-white grow">

        <div className="px-4 gap-2 flex flex-col xsm:flex-row flex-wrap w-max items-center text-center">
          {tab === 'general' ?
            (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('general')}>General</button>)
            :
            (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('general')}>General</button>)
          }
          {tab === 'collections' ?
            (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('collections')}>Collections</button>)
            :
            (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('collections')}>Collections</button>)
          }
        </div>

        <div className="gap-2 flex flex-col sm:flex-row w-full">
            {tab === 'general' && AdminFactory[tab]({ })}
            {tab === 'collections' && AdminFactory[tab]({ })}
          </div>

      </div>
    </>
  )
}

