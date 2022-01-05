import { useState } from 'react'

export default function Create() {
  const [values, setValues] = useState({ category: 'Art' });

  const handleName = (e) => {
    const existingValues = values;
    existingValues.name = e.target.value;
    setValues(existingValues);
  };

  const handleDescription = (e) => {
    const existingValues = values;
    existingValues.description = e.target.value;
    setValues(existingValues);
  };

  const handleCategory = (e) => {
    const existingValues = values;
    existingValues.category = e.target.value;
    setValues(existingValues);
  };

  const handleCommission = (e) => {
    const existingValues = values;
    existingValues.commission = e.target.value;
    setValues(existingValues);
    // console.log('values', values);
  };

  return (
    <main className="w-full flex self-start flex-col pl-4 pr-4 mt-10 mb-10">
      <div className="w-full rounded overflow-hidden shadow-lg bg-grayDark flex flex-col p-2 md:py-8 lg:py-12 xl:py-16 md:px-8 lg:px-12 xl:px-20">
        <div className="flex bg-grayDark" style={{minHeight: '500px'}}>
          <div className="flex flex-col w-96">

            <div className="p-2">
              <h2 className="text-3xl font-semibold text-gray-800 md:text-4xl">Create <span className="text-indigo-600">NFT</span></h2>
            </div>

            <div className="p-2">
              <form action="#" method="POST">
                <div className="shadow overflow-hidden rounded-md">

                  <div className="px-4 py-4 bg-white">

                    <div className="my-2">
                      <label htmlFor="nft-name" className="block text-sm font-medium text-gray-700">NFT name</label>
                      <input
                        type="text"
                        name="nft-name"
                        id="nft-name"
                        autoComplete="given-name"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-gray-300 rounded-md"
                        onChange={handleName}
                      />
                    </div>

                    <div className="my-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          placeholder=""
                          defaultValue={''}
                          required
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          onChange={handleDescription}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description about your NFT.
                      </p>
                    </div>

                    <div className="my-2">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        id="category"
                        name="category"
                        autoComplete="category-name"
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onChange={handleCategory}
                      >
                        <option>Art</option>
                        <option>Games</option>
                        <option>Sports</option>
                      </select>
                    </div>

                    <div className="my-2">
                      <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        name="commission"
                        id="commission"
                        autoComplete="given-name"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-gray-300 rounded-md"
                        onChange={handleCommission}
                      />
                    </div>

                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create
                    </button>
                  </div>

                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
  