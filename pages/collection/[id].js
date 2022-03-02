import { useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import IconTray from '../../components/IconTray';
import TilePanel from '../../components/TilePanel';
import PageError from '../../components/PageError';
import API from '../../components/Api';
import useSWR from 'swr';
import { useAuth } from '../../contexts/AuthContext';
import ContentWrapper from '../../components/wrappers/ContentWrapper';


export default function Collection() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();
  const { data: session, status: sessionStatus } = useSession();

  // swr call to fetch initial data
  const {data: collectionDataInit} = useSWR(API.swr.collection.id(ROUTER.query.id), API.swr.fetcher, API.swr.options);
  let collectionData = null;
  if (collectionDataInit && collectionDataInit.Items.length > 0) collectionData = collectionDataInit.Items[0];
  console.log('collectionData', collectionData);

  const tilePanelMonetary = {
    commission: { name: 'Commission', value: 0.02, format: 'percent' },
    reflection: { name: 'Reflection', value: 0.03, format: 'percent' },
    incentive: { name: 'Incentive', value: 0.03, format: 'percent' },
    incentiveBal: { name: 'Incentive Balance', value: 0.00, format: 'decimal' }
  };
  const tilePanelAdditional = {
    items: { name: 'Items', value: 12535343, format: 'decimal' },
    owners: { name: 'Owners', value: 123, format: 'decimal' },
    floor: { name: 'Floor Price', value: 0.00425744, format: 'decimal' },
    volume: { name: 'Volume Traded', value: 0.0042344, format: 'decimal' }
  };


  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === AuthContext.state.account &&
      ROUTER.query.wallet === AuthContext.state.account && AuthContext.state.isNetworkValid
    )
  };


  if (!collectionData || collectionData.length <= 0) {
      return (<PageError>Collection not found</PageError>);
  }

  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col w-full items-center">

        {/* <p onClick={() => {console.log('userData', userData)}}>See userData</p>
        <p onClick={() => {console.log('userState', userState)}}>See userState</p>
        <p onClick={() => ROUTER.push('/profile/0xdA121aB48c7675E4F25E28636e3Efe602e49eec6')}>user 0xdA121aB48c7675E4F25E28636e3Efe602e49eec6</p>
        <p onClick={() => ROUTER.push('/profile/0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED')}>user 0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED</p> */}

        {/* banner */}
        <div className='w-full text-center relative h-48 border-b'>
          <Image
          src={'/naturedesign.jpg'}
          placeholder='blur' blurDataURL='/avocado.jpg' alt='avocado' layout="fill" objectFit="cover" sizes='50vw'
          />
        </div>

        {/* top middle */}
        <div className='px-2 py-2 flex flex-col sm:flex-row justify-end text-center gap-4 w-full'>
          {/* left */}
          {/* <div className='flex flex-col flex-wrap items-center'>left</div> */}
          {/* middle */}
          <div className='flex flex-col flex-wrap flex-1 grow items-center'>
            {/* title */}
            <div className='px-2 py-2 flex flex-col flex-wrap w-full text-center'>
              <div className='w-full text-4xl font-bold'>{collectionData.name}asdas dasdasdasd asdasdasd</div>
              <div className='w-full truncate'>
                created by <Link href={`/profile/${collectionData.owner}`} passHref={true}><a className='text-blue-500 font-bold'>
                  {collectionData.ownerName && collectionData.ownerName }
                  {!collectionData.ownerName && collectionData.owner }
                </a></Link>
              </div>
            </div>
            {/* description */}
            <div className='w-full text-center overflow-y-auto max-h-40 max-w-xl '>
              {collectionData.description}
              asdhkahsdkjha asdhkashdkjahd kahds kajhsd kasdhsdhasjdhas jdhkjasdhkjasdhka
              sjdh jakshdkjash kjashd kjashd kjashd kjahsd kjahd kjashd kjahd kjahsdjhd
              aksdhjaksdhka jshdjkashdkashd kjashdkj ashdkjahdkjashd kjashd jkahsdkjashd kahsdkajhs dkjashdk jahdkjah
            </div>
          </div>
          {/* right */}
          <div className='flex flex-col flex-nowrap items-center'>
            <IconTray items={[ 'discord-solid', 'twitter-solid', 'website-solid' ]} />
          </div>
        </div>

        {/* top bottom */}
        <div className='px-2 py-2 flex flex-col sm:flex-row flex-wrap justify-center text-center gap-4 w-full'>
          <div className='flex flex-col flex-nowrap items-center flex-1'>
            <TilePanel title='Monetary Information' items={tilePanelMonetary} />
          </div>
          <div className='flex flex-col flex-nowrap items-center flex-1'>
            <TilePanel title='Additional Information' items={tilePanelAdditional} />
          </div>
        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: await getSession(context)
    },
  }
}
