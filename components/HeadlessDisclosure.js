import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

export default function HeadlessDisclosure({children, title, icon, classes, defaultOpen = false}) {
  return (
    <div className="w-full rounded-lg">
      <Disclosure defaultOpen={defaultOpen} >
        {({ open }) => (
          <>
            <Disclosure.Button className={`px-4 py-2 flex flex-row justify-between w-full text-sm font-medium text-left text-zinc-900 bg-zinc-100 border rounded-t-lg ${!open && 'rounded-b-lg'} hover:bg-zinc-200 focus:outline-none focus-visible:ring focus-visible:ring-zinc-300 focus-visible:ring-opacity-75`}>
              <div className='flex flex-row gap-x-1'>
                {icon && <span className="h-5 w-5">{icon}</span>}
                <span>{title}</span>
              </div>
              <ChevronUpIcon
                className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-zinc-800`}
              />
            </Disclosure.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className={`text-sm text-gray-500 bg-zinc-50 border rounded-b-lg ${classes}`}>
                {children}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  )
}
