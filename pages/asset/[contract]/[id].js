import { useState } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import useSWR from 'swr';
import IPFS from '@/utils/ipfs';
import { useAuth } from '@/contexts/AuthContext';
import IconTray from '@/components/IconTray';
import TilePanel from '@/components/TilePanel';
import PageError from '@/components/PageError';
import API from '@/components/Api';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import CollectionContent from '@/components/collection/CollectionContent';
import AssetImage from '@/components/asset/AssetImage';
import AssetAction from '@/components/asset/AssetAction';
import HeadlessDisclosure from '@/components/HeadlessDisclosure';
import NumberFormatter from '@/utils/NumberFormatter';
import { ShieldCheckIcon, ShieldExclamationIcon, DocumentTextIcon } from '@heroicons/react/solid';


export default function Collection({ assetDataInit }) {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();  
  // swr call to fetch initial data
  const {data: collectionDataInit} = useSWR(API.swr.collection.id(assetDataInit.collectionId), API.swr.fetcher, API.swr.options);

  console.log('assetDataInit', assetDataInit);
  console.log('collectionDataInit', collectionDataInit)

  // catch invalids early
  if (!assetDataInit || !assetDataInit.tokenId) return (<PageError>This asset does not exist</PageError>);



  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      AuthContext.state.isNetworkValid
    )
  };
  const isCollectionOwner = () => {
    return (isSignInValid() && session.user.id === collectionDataInit.owner);
  };

  const chainSymbols = {
    ethereum: (<Image src={'/chains/ethereum-color.svg'} placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw' />)
  };

  const assetInformation = () => {
    return (
      <>
      {/* description */}
      <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
        <HeadlessDisclosure
          title='Description' defaultOpen={true}
          icon={(<DocumentTextIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
        >
          {assetDataInit.config.description}
        </HeadlessDisclosure>
      </div>
      {/* attributes */}
      <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
        <HeadlessDisclosure
          title='Attributes'
          icon={(<DocumentTextIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
        >
          {assetDataInit.config.attributes}
        </HeadlessDisclosure>
      </div>
      {/* about collection */}
      <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
        <HeadlessDisclosure
          title={`About ${collectionDataInit && collectionDataInit.Items[0].name} Collection`}
          icon={(<DocumentTextIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
        >
          {collectionDataInit && collectionDataInit.Items[0].description}
        </HeadlessDisclosure>
      </div>
      {/* contract details */}
      <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
        <HeadlessDisclosure
          title='Contract Details'
          icon={(<DocumentTextIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
        >
          <div className='flex flex-col'>
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
              <div className='w-1/2'>Contract Address</div>
              <div className='text-blue-500 hover:text-blue-600 truncate'>
              <a href="https://google.ca/" target='blank'>{assetDataInit.contractAddress}</a>
                </div>
            </div>
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
              <div className='w-1/2'>Token ID</div>
              <div className='truncate'>{assetDataInit.tokenId}</div>
            </div>
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
              <div className='w-1/2'>Token Standard</div>
              <div className='truncate'>ERC-721</div>
            </div>
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
              <div className='w-1/2'>Blockchain</div>
              <div className='truncate'>Avalanche</div>
            </div>
            <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
              <div className='w-1/2'>Metadata</div>
              <div className='truncate'>{IPFS.isIpfsUrl(assetDataInit.config.image) ? 'IPFS' : 'Centralized'}</div>
            </div>
          </div>
        </HeadlessDisclosure>
      </div>
      </>
    )
  }


  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="pb-2 flex flex-col w-full items-center">

        <div className='p-2 gap-4 flex flex-col lg:flex-row w-full max-w-7xl lg:justify-center items-center lg:items-start'>
          {/* upper left side */}
          <div className="flex flex-col gap-2 justify-center items-center w-full max-w-xl lg:max-w-md">
            {/* collection name & icon tray */}
            <div className='lg:hidden flex flex-row flex-nowrap justify-between items-center w-full'>
              <div className="truncate">
                <Link href={collectionDataInit ? `/collection/${collectionDataInit.Items[0].id}` : '/'} passHref={true}>
                  <a className='font-mono text-lg text-blue-500 hover:text-blue-600'>{collectionDataInit && collectionDataInit.Items[0].name}</a>
                </Link>
              </div>
              <div className='flex flex-col flex-nowrap items-end xsm:items-center'>
                <IconTray items={[]} specialItems={[]} />
              </div>
            </div>
            {/* name */}
            <div className='lg:hidden flex flex-row flex-nowrap justify-start items-center w-full font-mono font-bold text-lg truncate'>
              {assetDataInit.config.name}
            </div>
            {/* image */}
            <div className='flex flex-col border rounded-lg overflow-hidden w-full'>
              <AssetImage
                header={(<>
                  <div className="flex-1">
                    <div className="relative h-5 w-5">{chainSymbols.ethereum}</div>
                  </div>
                  <div className='flex items-center'>
                    {assetDataInit.collectionId === 1 && <ShieldExclamationIcon className="w-5 h-5" fill="#ff3838" alt="unverified" title="unverified" aria-hidden="true" />}
                    {assetDataInit.collectionId !== 1 && <ShieldCheckIcon className="w-5 h-5" fill="#33cc00" alt="verified" title="verified" aria-hidden="true" />}
                  </div>
                </>)}
                image={assetDataInit.config.image}
              />
            </div>
            {/* more information */}
            <div className='hidden lg:flex flex-col gap-2 w-full'>
              {assetInformation()}
            </div>
          </div>

          {/* upper right side */}
          <div className="flex flex-col gap-2 justify-center items-center w-full max-w-xl lg:max-w-full">
            {/* collection name & icon tray */}
            <div className='hidden lg:flex flex-row flex-nowrap justify-between items-center w-full'>
              <div className="truncate">
                <Link href={collectionDataInit ? `/collection/${collectionDataInit.Items[0].id}` : '/'} passHref={true}>
                  <a className='font-mono text-lg text-blue-500 hover:text-blue-600'>{collectionDataInit && collectionDataInit.Items[0].name}</a>
                </Link>
              </div>
              <div className='flex flex-col flex-nowrap items-end xsm:items-center'>
                <IconTray items={[]} specialItems={[]} />
              </div>
            </div>
            {/* name */}
            <div className='hidden lg:block flex flex-row flex-nowrap justify-start items-center w-full font-mono font-bold text-lg truncate'>
              {assetDataInit.config.name}
            </div>
            {/* owner */}
            <div className='flex flex-row flex-nowrap gap-x-1 text-left w-full'>
              <div className=''>Owned by</div>
              <div className="truncate">
                {assetDataInit.ownerName && (<Link href={`/profile/${assetDataInit.owner}`} passHref={true}><a className='text-blue-500'>{assetDataInit.ownerName}</a></Link>)}
                {!assetDataInit.ownerName && (<Link href={`/profile/${assetDataInit.owner}`} passHref={true}><a className='text-blue-500'>{assetDataInit.owner}</a></Link>)}
              </div>
            </div>
            {/* marketplace actions */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <AssetAction />
            </div>
            {/* monetary */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Monetary'>
                <div className='flex flex-col'>
                  {assetDataInit.commission > 0 && (
                    <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                      <div className='w-1/2'>Artist Commission</div>
                      <div className='truncate'>{NumberFormatter(assetDataInit.commission/100,'percent')}</div>
                    </div>
                  )}
                  {collectionDataInit && assetDataInit.collectionId !== Number(process.env.NEXT_PUBLIC_UNVERIFIED_COLLECTION_ID) &&
                    assetDataInit.collectionId !== Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID) && (
                    <>
                      <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                        <div className='w-1/2'>Collection Commission</div>
                        <div className='truncate'>{NumberFormatter(collectionDataInit.Items[0].commission/100,'percent')}</div>
                      </div>
                      <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                        <div className='w-1/2'>Collection Reflection</div>
                        <div className='truncate'>{NumberFormatter(collectionDataInit.Items[0].reflection/100,'percent')}</div>
                      </div>
                      <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                        <div className='w-1/2'>Collection Incentive</div>
                        <div className='truncate'>{NumberFormatter(collectionDataInit.Items[0].incentive/100,'percent')}</div>
                      </div>
                      {Number(collectionDataInit.Items[0].incentive) > 0 && (
                        <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                          <div className='w-1/2'>Collection Incentive Pool Balance</div>
                          <div className='truncate'>{NumberFormatter(123456,'decimal')}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </HeadlessDisclosure>
            </div>
            {/* price history */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Price History'>
                1 my asdjh aksdh askdh askdh kasdhkasjdh aksd
              </HeadlessDisclosure>
            </div>
            {/* listings */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
            <HeadlessDisclosure title='Listings' defaultOpen={true}>
                2 askdh ajkhsf shjdf jhsdfg jhsdfg jhsdfg jhksdfg jhsfdg jhsdfg jsdgf jhsdfg js
                2 askdh ajkhsf shjdf jhsdfg jhsdfg jhsdfg jhksdfg jhsfdg jhsdfg jsdgf jhsdfg js
                2 askdh ajkhsf shjdf jhsdfg jhsdfg jhsdfg jhksdfg jhsfdg jhsdfg jsdgf jhsdfg js
                2 askdh ajkhsf shjdf jhsdfg jhsdfg jhsdfg jhksdfg jhsfdg jhsdfg jsdgf jhsdfg js
                2 askdh ajkhsf shjdf jhsdfg jhsdfg jhsdfg jhksdfg jhsfdg jhsdfg jsdgf jhsdfg js
              </HeadlessDisclosure>
            </div>
            {/* offers */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Offers'>
                <div className='flex flex-col justify-center items-center w-full'>
                  <IconTray items={[]} specialItems={[]} />
                </div>
              </HeadlessDisclosure>
            </div>
            {/* more information */}
            <div className='lg:hidden flex flex-col gap-2 w-full'>
              {assetInformation()}
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-2 justify-center items-center w-full max-w-xl lg:max-w-full">
          {/* item activity */}
          <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
            <HeadlessDisclosure title='Item Activity' defaultOpen={true}>
              1 my asdjh aksdh askdh askdh kasdhkasjdh aksd
            </HeadlessDisclosure>
          </div>
          {/* more from this collection */}
          <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
            <HeadlessDisclosure title='More From This Collection' defaultOpen={true}>
              1 my asdjh aksdh askdh askdh kasdhkasjdh aksd
            </HeadlessDisclosure>
          </div>
        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.asset.id(context.query.contract, context.query.id);
  let assetDataInit = { collectionId: 'null' };
  if (data.Items.length > 0) {
    assetDataInit = data.Items[0];
  }
  return {
    props: {
      assetDataInit,
      session: await getSession(context)
    },
  }
}
