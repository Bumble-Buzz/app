import { useEffect, useState, useRef } from 'react';
import useInView from 'react-cool-inview';
import useSWRInfinite from 'swr/infinite';
import ButtonWrapper from '../../wrappers/ButtonWrapper';
import API from '../../Api';
import CollectionsComponent from './CollectionsComponent';


export default function Collections({ activeCollections, inactiveCollections }) {

  const activeApi = (id, limit) => API.swr.collection.active(id, limit);
  const deactivate = async () => {
    console.log('deactivate');
  };

  const inactiveApi = (id, limit) => API.swr.collection.inactive(id, limit);
  const activate = async () => {
    console.log('activate');
  };

  return (
    <>
      <div className='py-4 flex flex-col gap-2'>
        <CollectionsComponent initialData={inactiveCollections} title='Inactive' api={inactiveApi} action={activate} />
        <CollectionsComponent initialData={activeCollections} title='Active' api={activeApi} action={deactivate} />
      </div>
    </>
  )
}

