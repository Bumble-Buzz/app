import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSession, getSession } from 'next-auth/react';
import WalletUtil from '@/components/wallet/WalletUtil';
import LinkWrapper from '@/components/wrappers/LinkWrapper';
import useSWR from 'swr';
import API from '@/components/Api';
import IPFS from '@/utils/ipfs';
import { useWallet } from '@/contexts/WalletContext';
import IconTray from '@/components/IconTray';
import PageError from '@/components/PageError';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import AssetImage from '@/components/asset/AssetImage';
import AssetAction from '@/components/asset/AssetAction';
import AssetPriceHistory from '@/components/asset/AssetPriceHistory';
import AssetActivity from '@/components/asset/AssetActivity';
import AssetsRelated from '@/components/asset/AssetsRelated';
import HeadlessDisclosure from '@/components/HeadlessDisclosure';
import Toast from '@/components/Toast';
import NumberFormatter from '@/utils/NumberFormatter';
import Tooltip from '@/components/Tooltip';
import { CHAIN_ICONS } from '@/enum/ChainIcons';
import {
  ShieldCheckIcon, ShieldExclamationIcon, QuestionMarkCircleIcon
} from '@heroicons/react/solid';
import {
  DocumentIcon, DocumentTextIcon, DocumentReportIcon, ClipboardListIcon
} from '@heroicons/react/outline';

import BankAbi from '@/artifacts/contracts/bank/Bank.sol/Bank.json';


export default function Asset({ assetDataInit }) {
  const WalletContext = useWallet();
  const { data: session, status: sessionStatus } = useSession();

  // swr call to fetch initial data
  const {data: assetData} = useSWR(API.swr.asset.id(
    (!assetDataInit.Item) ? '' : assetDataInit.Item.contractAddress, (!assetDataInit.Item) ? '' : assetDataInit.Item.tokenId
  ), API.swr.fetcher, {
    fallbackData: assetDataInit,
    ...API.swr.options
  });
  const {data: collectionDataInit} = useSWR(API.swr.collection.id(
    (!assetData.Item) ? '' : assetData.Item.collectionId
  ), API.swr.fetcher, API.swr.options);

  const [incentiveAmount, setIncentiveAmount] = useState(0);
  useEffect(async () => {
    if (collectionDataInit && Number(collectionDataInit.Items[0].incentive) > 0) {
      try {
        const signer = await WalletUtil.getWalletSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_BANK_CONTRACT_ADDRESS, BankAbi.abi, signer);

        // incentive amount
        const collectionAccount = await contract.getCollectionAccount(collectionDataInit.Items[0].contractAddress);
        const incentiveInt = Number(collectionAccount.incentiveVault);
        const incentiveBalance = Number(ethers.utils.formatEther(incentiveInt.toString()));
        setIncentiveAmount(incentiveBalance);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
      }
    }
  }, [collectionDataInit]);

  // catch invalids early
  if (!assetData || !assetData.Item || !assetData.Item.config) return (<PageError>This asset does not exist</PageError>);

  const isSignInValid = () => {
    return (
      session && sessionStatus === 'authenticated' && session.user.id === WalletContext.state.account &&
      WalletContext.state.isNetworkValid
    )
  };
  const isAssetOwner = () => {
    if (!isSignInValid()) return false;
    return (session.user.id === assetData.Item.owner);
  };
  const isAssetOnSale = () => {
    return (assetData.Item.onSale !== 0);
  };

  const getArrayAttributes = (attributes) => {
    return (
      attributes && attributes.length > 0 && attributes.map((attribute, index) => {
        return (
          <div className="block m-2 p-2 rounded-lg shadow-lg bg-indigo-50 max-w-sm w-20 min-w-fit" key={index}>
            <p className="text-indigo-500 font-bold text-base text-center">{attribute['trait_type']}</p>
            <p className="text-gray-700 text-base text-center">{attribute['value']}</p>
          </div>
        )
      })
    )
  };
  const getObjectAttributes = (attributes) => {
    return (
      attributes && Object.keys(attributes).map((attribute, index) => {
        return (
          <div className="block m-2 p-2 rounded-lg shadow-lg bg-indigo-50 max-w-sm w-20 min-w-fit" key={index}>
            <p className="text-indigo-500 font-bold text-base text-center">{attribute}</p>
            <p className="text-gray-700 text-base text-center">{attributes[attribute]}</p>
          </div>
        )
      })
    )
  };

  const assetInformation = () => {
    return (
      <>
        {/* description */}
        <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
          <HeadlessDisclosure
            title='Description' defaultOpen={true}
            icon={(<DocumentIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
            classes='px-4 py-2'
          >
            {assetData.Item.config.description}
          </HeadlessDisclosure>
        </div>
        {/* attributes */}
        <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
          <HeadlessDisclosure
            title='Attributes'
            icon={(<ClipboardListIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
            classes='px-4 py-2'
          >
            <div className="flex flex-wrap gap-2 justify-center items-center">
              {(assetData.Item.config.attributes).constructor === Array ?
                getArrayAttributes(assetData.Item.config.attributes) : getObjectAttributes(assetData.Item.config.attributes)
              }
            </div>
          </HeadlessDisclosure>
        </div>
        {/* about collection */}
        <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
          <HeadlessDisclosure
            title={`About ${collectionDataInit && collectionDataInit.Items[0].name} Collection`}
            icon={(<DocumentTextIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
            classes='px-4 py-2'
          >
            {collectionDataInit && collectionDataInit.Items[0].description}
          </HeadlessDisclosure>
        </div>
        {/* contract details */}
        <div className='flex flex-col flex-nowrap gap-2 justify-center items-center w-full'>
          <HeadlessDisclosure
            title='Contract Details'
            icon={(<DocumentReportIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />)}
            classes='px-4 py-2'
          >
            <div className='flex flex-col'>
              <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                <div className='w-1/2'>Contract Address</div>
                <div className='text-blue-500 hover:text-blue-600 truncate'>
                <a href="https://google.ca/" target='blank'>{assetData.Item.contractAddress}</a>
                  </div>
              </div>
              <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                <div className='w-1/2'>Token ID</div>
                <div className='truncate'>{assetData.Item.tokenId}</div>
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
                <div className='truncate'>{IPFS.isIpfsUrl(assetData.Item.config.image) ? 'IPFS' : 'Centralized'}</div>
              </div>
            </div>
          </HeadlessDisclosure>
        </div>
      </>
    )
  };

  const getAssetActionLinks = () => {
    return {
      cancelSale: `/asset/${assetData.Item.contractAddress}/${assetData.Item.tokenId}`,
      sellNow: `/sell/${assetData.Item.contractAddress}/${assetData.Item.tokenId}`,
      buyNow: `/asset/${assetData.Item.contractAddress}/${assetData.Item.tokenId}`,
      placeBid: `/asset/${assetData.Item.contractAddress}/${assetData.Item.tokenId}`,
      makeOffer: `/asset/${assetData.Item.contractAddress}/${assetData.Item.tokenId}`,
    }
  };
  const getAssetActionContent = () => {
    return {
      contractAddress: assetData.Item.contractAddress,
      tokenId: assetData.Item.tokenId,
      saleId: assetData.Item.saleId,
      saleType: assetData.Item.saleType,
      price: assetData.Item.price,
      seller: assetData.Item.owner,
      priceHistory: assetData.Item.priceHistory,
      activity: assetData.Item.activity
    }
  };

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
                <LinkWrapper link={`/collection/${assetData.Item.collectionId}`} linkText={assetData.Item.collectionName} />
              </div>
              <div className='flex flex-col flex-nowrap items-end xsm:items-center'>
                <IconTray items={[]} specialItems={[]} />
              </div>
            </div>
            {/* name */}
            <div className='lg:hidden flex flex-row flex-nowrap justify-start items-center w-full font-mono font-bold text-lg truncate'>
              {assetData.Item.config.name}
            </div>
            {/* image */}
            <div className='flex flex-col border rounded-lg overflow-hidden w-full'>
              <AssetImage
                header={(<>
                  <div className="flex-1">
                    <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                  </div>
                  <div className='flex items-center'>
                    {assetData.Item.collectionId === 1 && (
                      <Tooltip text='This asset does NOT belong to a verified collection'>
                        <ShieldExclamationIcon className="w-5 h-5" fill="#ff3838" alt="unverified" title="unverified" aria-hidden="true" />
                      </Tooltip>
                    )}
                    {assetData.Item.collectionId !== 1 && (
                      <Tooltip text='This asset belongs to a verified collection'>
                        <ShieldCheckIcon className="w-5 h-5" fill="#33cc00" alt="verified" title="verified" aria-hidden="true" />
                      </Tooltip>
                    )}
                  </div>
                </>)}
                image={assetData.Item.config.image}
                zIndex={'-z-10'}
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
                <LinkWrapper link={`/collection/${assetData.Item.collectionId}`} linkText={assetData.Item.collectionName} />
              </div>
              <div className='flex flex-col flex-nowrap items-end xsm:items-center'>
                <IconTray items={[]} specialItems={[]} />
              </div>
            </div>
            {/* name */}
            <div className='hidden lg:block flex flex-row flex-nowrap justify-start items-center w-full font-mono font-bold text-lg truncate'>
              {assetData.Item.config.name}
            </div>
            {/* owner */}
            <div className='flex flex-row flex-nowrap gap-x-1 text-left w-full'>
              <div className=''>Owned by</div>
              <div className="truncate">
                {assetData.Item.ownerName && (<LinkWrapper link={`/profile/${assetData.Item.owner}`} linkText={assetData.Item.ownerName} />)}
                {!assetData.Item.ownerName && (<LinkWrapper link={`/profile/${assetData.Item.owner}`} linkText={assetData.Item.owner} />)}
              </div>
            </div>
            {/* marketplace actions */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <AssetAction
                links={getAssetActionLinks()}
                content={getAssetActionContent()}
                isSignInValid={isSignInValid()}
                isAssetOwner={isAssetOwner()}
                isAssetOnSale={isAssetOnSale()}
              />
            </div>
            {/* monetary */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Monetary' classes='px-4 py-2' defaultOpen={true}>
                <div className='flex flex-col'>
                  {assetData.Item.commission > 0 && (
                    <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                      <div className='flex flex-row gap-x-1 w-1/2'>
                        Artist Commission
                        <Tooltip text='Creator of the NFT takes commission from the final sale'>
                          <QuestionMarkCircleIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />
                        </Tooltip>
                      </div>
                      <div className='truncate'>{NumberFormatter(assetData.Item.commission/100,'percent')}</div>
                    </div>
                  )}
                  {collectionDataInit && assetData.Item.collectionId !== Number(process.env.NEXT_PUBLIC_UNVERIFIED_COLLECTION_ID) &&
                    assetData.Item.collectionId !== Number(process.env.NEXT_PUBLIC_LOCAL_COLLECTION_ID) && (
                    <>
                      <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                        <div className='flex flex-row gap-x-1 w-1/2'>
                          Collection Commission
                          <Tooltip text='Collection owner takes commission from the final sale'>
                            <QuestionMarkCircleIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />
                          </Tooltip>
                        </div>
                        <div className='truncate'>{NumberFormatter(collectionDataInit.Items[0].commission/100,'percent')}</div>
                      </div>
                      <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                        <div className='flex flex-row gap-x-1 w-1/2'>
                          Collection Reflection
                          <Tooltip text='All NFT holders of this collection share commission from the final sale'>
                            <QuestionMarkCircleIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />
                          </Tooltip>
                        </div>
                        <div className='truncate'>{NumberFormatter(collectionDataInit.Items[0].reflection/100,'percent')}</div>
                      </div>
                      <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                        <div className='flex flex-row gap-x-1 w-1/2'>
                          Collection Incentive
                          <Tooltip text='Seller of NFT receives incentives on top of profit from the final sale'>
                            <QuestionMarkCircleIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />
                          </Tooltip>
                        </div>
                        <div className='truncate'>{NumberFormatter(collectionDataInit.Items[0].incentive/100,'percent')}</div>
                      </div>
                      {Number(collectionDataInit.Items[0].incentive) > 0 && (
                        <div className='flex flex-row flex-nowrap justify-between items-center gap-2 w-full'>
                          <div className='flex flex-row gap-x-1 w-1/2'>
                            Collection Incentive Pool Balance
                            <Tooltip text='Balance of the collection incentive pool'>
                              <QuestionMarkCircleIcon className="w-5 h-5" alt="verified" title="verified" aria-hidden="true" />
                            </Tooltip>
                          </div>
                          <div className='flex flex-row flex-nowrap justify-center items-center'>
                            <div className="relative h-5 w-5">{CHAIN_ICONS.ethereum}</div>
                            <div className='truncate'>{NumberFormatter(incentiveAmount,'decimal')}</div>
                          </div>
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
                <div className='flex flex-col justify-center items-center w-full'>
                  <AssetPriceHistory initialData={assetData.Item} />
                </div>
              </HeadlessDisclosure>
            </div>
            {/* listings */}
            {/* <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Listings' defaultOpen={ assetData.Item.activity.length > 0 ? true : false }>
                <div className='flex flex-col justify-center items-center w-full'>
                  <AssetActivity initialData={assetData.Item} />
                </div>
              </HeadlessDisclosure>
            </div> */}
            {/* offers */}
            {/* <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Offers'>
                <div className='flex flex-col justify-center items-center w-full'>
                  <p>No offers</p>
                </div>
              </HeadlessDisclosure>
            </div> */}
            {/* more information */}
            <div className='lg:hidden flex flex-col gap-2 w-full'>
              {assetInformation()}
            </div>
          </div>

        </div>

        <div className='p-2 gap-4 flex flex-col lg:flex-row w-full max-w-7xl lg:justify-center items-center lg:items-start'>

          <div className="flex flex-col gap-2 justify-center items-center w-full max-w-xl lg:max-w-full">
            {/* item activity */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='Item Activity' defaultOpen={ assetData.Item.activity.length > 0 ? true : false }>
                <div className='flex flex-col justify-center items-center w-full'>
                  <AssetActivity initialData={assetData.Item} />
                </div>
              </HeadlessDisclosure>
            </div>
            {/* more from this collection */}
            <div className='flex flex-col flex-nowrap justify-center items-center w-full'>
              <HeadlessDisclosure title='More From This Collection' defaultOpen={true}>
                <div className='flex flex-col justify-center items-center w-full'>
                  <AssetsRelated initialData={assetData.Item} />
                </div>
              </HeadlessDisclosure>
            </div>
          </div>

        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps(context) {
  const { data } = await API.backend.asset.id(context.query.contract, context.query.id);
  return {
    props: {
      assetDataInit: data,
      session: await getSession(context)
    }
  }
}
