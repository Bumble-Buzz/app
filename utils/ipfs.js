import CheckEnvironment from '@/components/CheckEnvironment';


const getIpfsBaseUrl = (val = '') => {
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

const getBumbleBuzzBaseUrl = (val = '') => {
  return `https://bumblebuzz.s3.us-east-1.amazonaws.com/image/${val}`;
};

const getValidHttpUrl = (_url) => {
  let validUrl = '';
  if (isBumbleBuzzUrl(_url)) validUrl = _url.replace('bumblebuzz://', getBumbleBuzzBaseUrl());
  if (isIpfsUrl(_url)) validUrl = _url.replace('ipfs://', getIpfsBaseUrl());
  // console.log('valid url:', _url, validUrl);
  return validUrl;
};

const isBumbleBuzzUrl = (_url) => {
  return (_url.includes("bumblebuzz://"))
};
const isIpfsUrl = (_url) => {
  return (_url.includes("ipfs://"))
};


module.exports = {
  getIpfsBaseUrl,
  getValidHttpUrl,
  isBumbleBuzzUrl,
  isIpfsUrl
}