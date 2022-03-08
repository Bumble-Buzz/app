import { useState } from 'react';
import API from '@/components/Api';
import Toast from '@/components/Toast';
import ActiveInactive from './ActiveInactive';

export default function Specific({ }) {
  const [assets, setAssets] = useState([]);
  const [requestType, setRequestType] = useState('id');
  const [value, setValue] = useState('');

  const fetch = async (e) => {
    e.preventDefault();

    if (requestType === 'id') {
      try {
        const results = await API.collection.id(value);
        setAssets(results.data);
      } catch (e) {
        Toast.error(e.message);
      }
    }
  };

  const activeApi = () => '';


  return (
    <>

      <div className='py-2 px-4 text-left font-bold'>Fetch specific collection</div>

      <form onSubmit={(e) => {fetch(e)}} method="POST" className="px-2 py-0 flex flex-row flex-wrap gap-2 items-center text-center">
        <div className="">
          <select
            id="request"
            name="request"
            autoComplete="request-type"
            required
            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
            onChange={(e) => setRequestType(e.target.value)}
          >
            <option value='id'>ID</option>
            {/* <option value='name'>Name</option>
            <option value='address'>Contract Address</option> */}
          </select>
        </div>

        <div className="grow">
          <input
            type="text"
            name="value"
            id="value"
            value={value}
            autoComplete="off"
            placeholder="value"
            required
            className="mt-1 w-44 xsm:w-full focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md"
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >Fetch</button>
        </div>

        <div className="">
          <button
            type="text"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={(e) => {e.preventDefault(); setAssets([]); setValue('');}}
          >Clear</button>
        </div>
      </form>

      <ActiveInactive initialData={assets} isSearch={false} classes='h-auto' api={activeApi} />

    </>
  )
}

