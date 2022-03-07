import Image from 'next/image';
import { MenuIcon } from '@heroicons/react/solid';
import DropDown from './navbar/DropDown';
import { RefreshIcon } from '@heroicons/react/solid';
import Tooltip from './Tooltip';


export default function IconTray({ items }) {

  const getItem = (itemId) => {
    switch(itemId) {
      case 1:
        return {
          label: 'Refresh metadata',
          link: '/',
          icon: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      case 2:
        return {
          label: 'Report',
          link: '/',
          icon: (<MenuIcon className="w-5 h-5 mr-2" aria-hidden="true" />),
          iconOutline: (<MenuIcon className="w-5 h-5 mr-2" aria-hidden="true" />)
        };
      default:
        return {};
    };
  };

  return (
    <div className='grid grid-rows-1 grid-flow-col w-fit divide-x border rounded-lg shadow-lg bg-gray-50 items-center text-center'>
      {/* <div className='relative pl-1 mr-3 h-5 w-5 transform transition duration-500 hover:scale-105 cursor-pointer'>
        <RefreshIcon className="w-5 h-5 mr-2" aria-hidden="true" />
      </div> */}
      {items && items.map((item, index) => {
        return (
          <div className='px-4 my-2 relative h-5 w-5 transform transition duration-500 hover:scale-105 cursor-pointer' key={index}>
            <Tooltip text={`Hover text here - ${item}`}>
              <Image
                src={`/socials/${item}.svg`} placeholder='blur' blurDataURL='/avocado.jpg'
                alt='discord' layout="fill" objectFit="contain" sizes='50vw'
              />
            </Tooltip>
          </div>
        )
      })}
      <div className='relative pl-1 mr-3 h-5 w-5 transform transition duration-500 hover:scale-105 cursor-pointer'>
        <DropDown title='title' items={[1,2]} getItem={getItem} typeImage={true} image={'/menu.svg'} imageStyle={'h-5 w-5'} />
      </div>
    </div>
  )
}
