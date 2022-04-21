import { useState } from 'react';
import Image from 'next/image';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import useSWR from 'swr';
import IPFS from '@/utils/ipfs';
import { useWallet } from '@/contexts/WalletContext';
import IconTray from '@/components/IconTray';
import TilePanel from '@/components/TilePanel';
import PageError from '@/components/PageError';
import API from '@/components/Api';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import { FilterProvider } from '@/contexts/FilterContext';
import CollectionContent from '@/components/collection/CollectionContent';
import CollectionFilterPanel from '@/components/collection/CollectionFilterPanel';
import Tooltip from '@/components/Tooltip';
import ENUM from '@/enum/ENUM';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/solid';


const BATCH_SIZE = 40;


export default function Collection({ collectionDataInit }) {
  const ROUTER = useRouter();
  const WalletContext = useWallet();
  const { data: session, status: sessionStatus } = useSession();  
  // swr call to fetch initial data
  const {data: assetInit} = useSWR(API.swr.asset.collectionId(collectionDataInit.id, 'null', 'null', BATCH_SIZE), API.swr.fetcher, API.swr.options);


  // catch invalids early
  if (!collectionDataInit || !collectionDataInit.id) return (<PageError>This collection does not exist</PageError>);
  if (!collectionDataInit.active) return (<PageError>This collection has been deactivated</PageError>);


  const getItemSymbol = () => {
    if (collectionDataInit.ownerIncentiveAccess) {
      return (<Tooltip text='Collection owner DOES have access to the incentive pool'>
        <ShieldExclamationIcon className="w-5 h-5" fill="#ff3838" alt="unverified" title="unverified" aria-hidden="true" />
      </Tooltip>)
    } else {
      return (<Tooltip text='Collection owner does NOT have access to the incentive pool'>
        <ShieldCheckIcon className="w-5 h-5" fill="#33cc00" alt="verified" title="verified" aria-hidden="true" />
      </Tooltip>)
    }
  };

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === WalletContext.state.account &&
      WalletContext.state.isNetworkValid
    )
  };
  const isCollectionOwner = () => {
    return (isSignInValid() && session.user.id === collectionDataInit.owner);
  };

  const tilePanelMonetary = {
    commission: { name: 'Commission', value: collectionDataInit.commission/100, format: 'percent', symbol: '' },
    reflection: { name: 'Reflection', value: collectionDataInit.reflection/100, format: 'percent', symbol: '' },
    incentive: { name: 'Incentive', value: collectionDataInit.incentive/100, format: 'percent', symbol: '' },
    incentiveBal: { name: 'Incentive Balance', value: 0.00, format: 'decimal', symbol: ENUM.CHAIN_ICONS.ethereum, itemSymbol: getItemSymbol() }
  };
  const tilePanelAdditional = {
    items: { name: 'Items', value: collectionDataInit.totalSupply, format: 'decimal', symbol: '' },
    owners: { name: 'Owners', value: 123, format: 'decimal', symbol: '' },
    floor: { name: 'Floor Price', value: 0.00425744, format: 'decimal', symbol: ENUM.CHAIN_ICONS.ethereum },
    volume: { name: 'Volume Traded', value: 0.0042344, format: 'decimal', symbol: ENUM.CHAIN_ICONS.ethereum }
  };
  const iconTraySpecialItems = () => {
    let list = [];
    if (isCollectionOwner()) list.push('Edit');
    return list;
  };


  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col w-full items-center">

        {/* <p onClick={() => {console.log('userData', userData)}}>See userData</p> */}
        {/* <p onClick={() => {console.log('userState', userState)}}>See userState</p> */}
        {/* <p onClick={() => ROUTER.push('/profile/0xdA121aB48c7675E4F25E28636e3Efe602e49eec6')}>user 0xdA121aB48c7675E4F25E28636e3Efe602e49eec6</p> */}
        {/* <p onClick={() => ROUTER.push('/profile/0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED')}>user 0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED</p> */}
        {/* <p onClick={() => {console.log('collectionDataInit', collectionDataInit)}}>See collectionDataInit</p>
        <p onClick={() => {console.log('assetInit', assetInit)}}>See assetInit</p> */}

        {/* banner */}
        <div className='w-full text-center relative h-48 border-b'>
          <Image
          src={IPFS.getValidHttpUrl(collectionDataInit.image)}
          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw'
          />
        </div>

        {/* top middle */}
        <div className='px-2 py-2 flex flex-col sm:flex-row justify-end text-center gap-4 w-full'>
          {/* middle */}
          <div className='flex flex-col flex-wrap flex-1 grow items-center'>
            {/* title */}
            <div className='px-2 py-2 flex flex-col flex-wrap w-full text-center'>
              <div className='w-full text-4xl font-bold'>{collectionDataInit.name} asdas dasdasdasd asdasdasd</div>
              <div className='w-full truncate'>
                <>created by </>
                {collectionDataInit.ownerName && (<LinkWrapper link={`/profile/${collectionDataInit.owner}`} linkText={collectionDataInit.ownerName} />)}
                {!collectionDataInit.ownerName && (<LinkWrapper link={`/profile/${collectionDataInit.owner}`} linkText={collectionDataInit.owner} />)}
              </div>
            </div>
            {/* description */}
            <div className='w-full text-center overflow-y-auto max-h-40 max-w-xl '>
              {collectionDataInit.description}
              asdhkahsdkjha asdhkashdkjahd kahds kajhsd kasdhsdhasjdhas jdhkjasdhkjasdhka
              sjdh jakshdkjash kjashd kjashd kjashd kjahsd kjahd kjashd kjahd kjahsdjhd
              aksdhjaksdhka jshdjkashdkashd kjashdkj ashdkjahdkjashd kjashd jkahsdkjashd kahsdkajhs dkjashdk jahdkjah
            </div>
          </div>
          {/* icon tray */}
          <div className='flex flex-col flex-nowrap items-end xsm:items-center'>
            <IconTray items={collectionDataInit.social} specialItems={iconTraySpecialItems()} options={{ id: collectionDataInit.id }} />
          </div>
        </div>

        {/* tile panels */}
        <div className='px-2 py-2 flex flex-col md:flex-row flex-wrap justify-center text-center gap-4 w-full'>
          <div className='flex flex-col flex-nowrap items-center flex-1'>
            <TilePanel title='Monetary Information' items={tilePanelMonetary} />
          </div>
          <div className='flex flex-col flex-nowrap items-center flex-1'>
            <TilePanel title='Additional Information' items={tilePanelAdditional} />
          </div>
        </div>

        {/* bottom */}
        <div className='flex flex-col sm:flex-row w-full'>
          <FilterProvider>
            <div className="-px-2 -ml-2 bg-white">
              <CollectionFilterPanel />
            </div>
            <div className="px-2 bg-white w-full">
              <CollectionContent initialData={assetInit} collectionData={collectionDataInit} />
            </div>
          </FilterProvider>
        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.collection.id(context.query.id);
  let collectionDataInit = { contractAddress: 'null' };
  if (data.Items.length > 0) {
    collectionDataInit = data.Items[0];
  }
  return {
    props: {
      collectionDataInit,
      session: await getSession(context)
    },
  }
}
