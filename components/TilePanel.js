
export default function TilePanel({ title, items }) {

  const format = (value, format) => {
    const formatter = Intl.NumberFormat('en', {
      style: format,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
    return formatter.format(value);
  };

  return (
    <div className='grid-rows-1 grid-flow-col w-fit border rounded-lg overflow-hidden shadow-lg bg-gray-50'>
      <div className='flex flex-col flex-nowarp w-full border-b'>{title}</div>
      <div className='hidden xsm:grid grid-cols-4 w-full divide-x'>
        {items && Object.keys(items).map((key, index) => {
          return (
            <div className={`'px-2 py-2 flex flex-col flex-nowarp' ${items[key].itemSymbol ? 'relative' : ''}`} key={index}>
              {items[key].itemSymbol && (<span className="absolute h-5 w-5 right-0 top-0">{items[key].itemSymbol}</span>)}
              <div className='flex flex-row justify-center items-center'>
                {items[key].symbol && (<div className="relative h-5 w-5">{items[key].symbol}</div>)}
                <div className="">{format(items[key].value,items[key].format)}</div>
              </div>
              <div className='px-1 font-thin'>{items[key].name}</div>
            </div>
          )
        })}
      </div>
      <div className="xsm:hidden grid grid-cols-2 divide-x divide-y">
        {items && Object.keys(items).map((key, index) => {
          return (
            <div className={`'px-2 py-2 flex flex-col flex-nowarp' ${items[key].itemSymbol ? 'relative' : ''}`} key={index}>
              {items[key].itemSymbol && (<span className="absolute h-5 w-5 right-0 top-0">{items[key].itemSymbol}</span>)}
              <div className=''>{items[key].value}</div>
              <div className='px-1 font-thin'>{items[key].name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
