
export default function TilePanel({ title, items }) {

  return (
    <div className='flex flex-col w-fit border rounded-lg overflow-hidden shadow-lg bg-gray-50'>
      <div className='flex flex-col w-full border-b'>{title}</div>
      <div className='hidden xsm:grid grid-rows-1 grid-flow-col w-full divide-x'>
        {items && Object.keys(items).map((key, index) => {
          return (
            <div className='px-2 py-2 flex flex-col flex-nowarp' key={index}>
              <div className='truncate'>{items[key].value}</div>
              <div className='font-thin'>{items[key].name}</div>
            </div>
          )
        })}
      </div>
      <div className="xsm:hidden grid grid-cols-2 divide-x">
        {items && Object.keys(items).map((key, index) => {
          return (
            <div className='px-2 py-2 flex flex-col flex-nowarp' key={index}>
              <div className='truncate'>{items[key].value}</div>
              <div className='font-thin'>{items[key].name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
