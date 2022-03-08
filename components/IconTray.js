import Image from 'next/image';
import { MenuIcon } from '@heroicons/react/solid';
import DropDown from './navbar/DropDown';
import Tooltip from './Tooltip';
import Discord from '../public/socials/discord-solid.svg';
import Twitter from '../public/socials/twitter-solid.svg';
import Website from '../public/socials/website-solid.svg';
import Menu from '../public/menu.svg';
import { RefreshIcon } from '@heroicons/react/solid';


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
      {items && items.filter((item) => item.link).map((item, index) => {
        return (
          <a href="https://google.ca/" target='blank' key={index}>
            <Tooltip text={`${item.hover}`}>
              <div className='mx-2 my-2 transform transition duration-500 hover:scale-105 cursor-pointer'>
                {item.name === 'discord' && <Discord height={24} width={24} />}
                {item.name === 'twitter' && <Twitter height={24} width={24} />}
                {item.name === 'website' && <Website height={24} width={24} />}
              </div>
            </Tooltip>
          </a>
        )
      })}
      <div className='mx-2 my-2 transform transition duration-500 hover:scale-105 cursor-pointer'>
        <DropDown title='title' items={[1,2]} getItem={getItem} isImage={true} isSvg={true} image={<Menu height={24} width={24} />} />
      </div>
    </div>
  )
}
