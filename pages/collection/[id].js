import { useState } from 'react'
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import { useAuth } from '../../contexts/AuthContext';
import ContentWrapper from '../../components/wrappers/ContentWrapper';


export default function Collection() {
  const ROUTER = useRouter();
  const AuthContext = useAuth();


  return (
    <ContentWrapper>
      {/* Page Content */}
      <div className="flex flex-col w-full">

        {/* <p onClick={() => {console.log('userData', userData)}}>See userData</p>
        <p onClick={() => {console.log('userState', userState)}}>See userState</p>
        <p onClick={() => ROUTER.push('/profile/0xdA121aB48c7675E4F25E28636e3Efe602e49eec6')}>user 0xdA121aB48c7675E4F25E28636e3Efe602e49eec6</p>
        <p onClick={() => ROUTER.push('/profile/0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED')}>user 0xC0E62F2F7FDfFF0679Ab940E29210E229cDCb8ED</p> */}

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
