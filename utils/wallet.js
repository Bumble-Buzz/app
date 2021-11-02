import { ethers } from 'ethers';
import Web3Modal from 'web3modal';


let WEB_3_MODAL;

const _setWeb3Modal = () => {
  if (!WEB_3_MODAL) {
    WEB_3_MODAL = new Web3Modal();
  }
};

const getDefaultProvider = () => {
  _setWeb3Modal();
  const provider = new ethers.providers.JsonRpcProvider();
  return provider;
};

const getProvider = async () => {
  _setWeb3Modal();
  const connection = await WEB_3_MODAL.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  return provider;
};

const getSigner = async () => {
  _setWeb3Modal();
  const provider = await getProvider();
  const signer = provider.getSigner();
  return signer;
};

const isNetworkValid = async () => {
  const provider = await getProvider();
  const network = await provider.getNetwork();

  if (network.chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)) {
    return true;
  }
  return false;
};


module.exports = {
  getDefaultProvider,
  getProvider,
	getSigner,
  isNetworkValid
}
