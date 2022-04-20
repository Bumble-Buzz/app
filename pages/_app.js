import '../styles/globals.css';
import Head from 'next/head';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/Footer';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { SessionProvider } from "next-auth/react"
import { WalletProvider } from '@/contexts/WalletContext'


function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <WalletProvider>
        <Head>
          <title>AvaxTrade</title>
          <meta name="description" content="Generated a AvaxTrade NFT on AVAX!" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Navbar {...pageProps} />
        <Component {...pageProps} />
        <Footer />
      </WalletProvider>
    </SessionProvider>
  )
}

export default MyApp
