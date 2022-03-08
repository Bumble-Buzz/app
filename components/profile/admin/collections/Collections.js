import { useRouter } from 'next/router';
import ActiveInactive from './ActiveInactive';
import Specific from './Specific';
import API from '@/components/Api';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import { ArrowRightIcon } from '@heroicons/react/solid';


export default function Collections({ activeCollections, inactiveCollections }) {
  const ROUTER = useRouter();

  const activeApi = (id, limit) => API.swr.collection.active(id, limit);
  const inactiveApi = (id, limit) => API.swr.collection.inactive(id, limit);

  return (
    <>
      <div className='py-2 px-4 flex flex-wrap gap-2 justify-start items-center'>
        <ButtonWrapper
          classes="border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
          onClick={() => ROUTER.push('/collection/create/local')}
        >
          Create local collection
          <ArrowRightIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
        </ButtonWrapper>
        <ButtonWrapper
          classes="border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
          onClick={() => ROUTER.push('/collection/create/verified')}
        >
          Create verified collection
          <ArrowRightIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
        </ButtonWrapper>
        <ButtonWrapper
          classes="border border-inherit rounded-2xl text-black bg-indigo-300 hover:bg-indigo-400 focus:ring-0"
          onClick={() => ROUTER.push('/collection/create/unverified')}
        >
          Create unverified collection
          <ArrowRightIcon className="w-5 h-5" alt="clear" title="clear" aria-hidden="true" />
        </ButtonWrapper>
      </div>
      <div className='py-4 flex flex-col gap-2'>
        <Specific />
        <ActiveInactive initialData={inactiveCollections} title='Inactive collections' api={inactiveApi} />
        <ActiveInactive initialData={activeCollections} title='Active collections' api={activeApi} />
      </div>
    </>
  )
}

