import API from '../../../Api';
import ActiveInactive from './ActiveInactive';
import Specific from './Specific';


export default function Collections({ activeCollections, inactiveCollections }) {

  const activeApi = (id, limit) => API.swr.collection.active(id, limit);
  const deactivate = async (asset) => {
    console.log('deactivate');
    await API.collection.deactivate(asset.id);
  };

  const inactiveApi = (id, limit) => API.swr.collection.inactive(id, limit);
  const activate = async (asset) => {
    console.log('activate');
    await API.collection.activate(asset.id);
  };

  return (
    <>
      <div className='py-4 flex flex-col gap-2'>
        <Specific />
        <ActiveInactive initialData={inactiveCollections} title='Inactive collections' api={inactiveApi} action={activate} />
        <ActiveInactive initialData={activeCollections} title='Active collections' api={activeApi} action={deactivate} />
      </div>
    </>
  )
}

