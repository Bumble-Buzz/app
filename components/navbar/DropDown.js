import { useState } from 'react';
import { Fragment } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/solid';


export default function DropDown({
    children,
    items, getItem, showSelectedItem = false,
    title, titleStyle = 'inline-flex justify-center w-full font-medium bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75',
    isImage, isSvg, image = '/person.png', imageStyle = 'h-10 w-10 border-2 border-black-600 rounded-full overflow-hidden',
    menuStyle = 'right-0 w-48 z-10 mt-2 origin-top-right'
  }) {
  const ROUTER = useRouter();
  const [selectedItem, setSelectedItem] = useState(null);

  const label = () => {
    if (!selectedItem) return (<>{title}</>);
    if (showSelectedItem) return (<>{getItem(selectedItem).label}</>);
    return (<>{title}</>);
  };

  return (
      <Menu as="div" className="relative w-full">

        {!isImage && (
          <Menu.Button className={`rounded-md ${titleStyle}`}>
            {label()}
            <ChevronDownIcon className="w-5 h-5 pt-1 pr-1 text-violet-200 hover:text-violet-100" aria-hidden="true" />
          </Menu.Button>
        )}
        {isImage && !isSvg && (
          <Menu.Button className="flex flex-col justify-center items-center text-center">
            <div className={`relative ${imageStyle}`}>
              <Image
                src={image} placeholder='blur' blurDataURL='/person.png' alt='Profile' aria-hidden="true"
                layout="fill" objectFit="contain" sizes='50vw'
              />
            </div>
          </Menu.Button>
        )}
        {isImage && isSvg && (
          <Menu.Button className="flex flex-col justify-center items-center text-center">
            {image}
          </Menu.Button>
        )}

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className={`absolute bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden ${menuStyle}`}>
            <div className="">
              {items && items.length > 0 && items.map((item, index) => {
                return (
                  <Menu.Item key={index} onClick={() => {
                    setSelectedItem(item);
                    if (getItem(item).link) return ROUTER.push(getItem(item).link);
                    if (getItem(item).action) return getItem(item).action();
                  }}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-300 text-gray-600' : 'text-gray-600'
                        } px-2 py-2 group flex border-b border-gray-200 items-center w-full text-sm`}
                      >
                        {active ? getItem(item).icon : getItem(item).iconOutline}
                        {getItem(item).label}
                      </button>
                    )}
                  </Menu.Item>
                )
              })}
            </div>
          </Menu.Items>
        </Transition>

      </Menu>
  )
}
