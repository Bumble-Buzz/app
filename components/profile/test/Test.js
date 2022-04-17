import { useState } from 'react';
import TestFactory from './TestFactory';


export default function Test({ }) {
  const [tab, setTab] = useState('general');

  return (
    <>
      <div className="px-4 gap-2 flex flex-col xsm:flex-row flex-wrap w-max items-center text-center">
        {tab === 'general' ?
          (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('general')}>General</button>)
          :
          (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('general')}>General</button>)
        }
        {tab === 'mint' ?
          (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500" onClick={() => setTab('collections')}>Mint</button>)
          :
          (<button className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none" onClick={() => setTab('mint')}>Mint</button>)
        }
      </div>

      <div className="gap-2 flex flex-col">
          {tab === 'general' && TestFactory[tab]({ })}
          {tab === 'mint' && TestFactory[tab]({ })}
      </div>
    </>
  )
}
