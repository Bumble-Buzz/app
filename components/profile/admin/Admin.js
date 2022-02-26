import { useEffect, useState, useReducer } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import API from '../../Api';
import useSWR from 'swr';
import AdminFactory from './AdminFactory';


export default function Admin() {
  const ROUTER = useRouter();
  const [tab, setTab] = useState('general');

  const {data: activeCollections} = useSWR(API.swr.collection.active('null', 10), API.swr.fetcher, API.swr.options);
  const {data: inactiveCollections} = useSWR(API.swr.collection.inactive('null', 10), API.swr.fetcher, API.swr.options);

  return (
    <div className="p-1 rounded-lg shadow-lg bg-white">

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

      <div className="gap-2 flex flex-col">
          {tab === 'general' && AdminFactory[tab]({ })}
          {tab === 'collections' && AdminFactory[tab]({ activeCollections, inactiveCollections })}
        </div>

    </div>
  )
}

