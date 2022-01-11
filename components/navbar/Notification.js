import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../Button';
import {ChevronRightIcon, ChevronLeftIcon, PencilIcon, SearchIcon, XIcon} from '@heroicons/react/solid';


export default function Notification({ children, handleClick }) {
  const ROUTER = useRouter();

  return (
    <div className="flex flex-wrap justify-center">

      <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
        <span className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer">X</span>
        <p className="text-gray-700 text-base">
          You have received a new bid on "NFT SALE TITLE" sale.
        </p>
      </div>
      <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
        <span className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer">X</span>
        <p className="text-gray-700 text-base">
          You have received a new bid on "NFT SALE TITLE" sale.
        </p>
      </div>
      <div className="block m-2 p-2 rounded-lg shadow-lg bg-white max-w-sm relative">
        <span className="-mx-2 -mt-3 px-1.5 text-white bg-red-700 absolute right-0 rounded-full text-xs cursor-pointer">X</span>
        <p className="text-gray-700 text-base">
          You have received a new bid on "NFT SALE TITLE" sale.
        </p>
      </div>

      <Button className="mt-4" onClick={() => handleClick(false)}>Notification Close</Button>

    </div>
  );
}
