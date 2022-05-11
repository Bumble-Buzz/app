import CheckEnvironment from '@/components/CheckEnvironment';


const getValidBaseUrl = (val = '') => {
  let baseUrl;
  if (CheckEnvironment.isDevMode) {
    baseUrl = `http://localhost:8080/ipfs/${val}`;
  } else if (CheckEnvironment.isDevKindMode) {
    baseUrl = `https://ipfs.bumblebuzz.io/ipfs/${val}`;
  } else {
    baseUrl = `https://ipfs.bumblebuzz.io/ipfs/${val}`;
  }
  return baseUrl;
};

const getValidHttpUrl = (_ipfsUrl) => {
  const validUrl = _ipfsUrl.replace(
    'ipfs://',
    getValidBaseUrl()
  );
  console.log('validUrl', validUrl);
  return validUrl;
};

const isIpfsUrl = (_ipfsUrl) => {
  return (_ipfsUrl.includes("ipfs://"))
};


module.exports = {
  getValidBaseUrl,
  getValidHttpUrl,
  isIpfsUrl
}