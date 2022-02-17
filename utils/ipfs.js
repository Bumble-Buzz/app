import CheckEnvironment from '../components/CheckEnvironment';


const getValidBaseUrl = (val = '') => {
  let baseUrl;
  if (CheckEnvironment.isDevMode) {
    baseUrl = `http://localhost:8080/ipfs/${val}`;
  } else if (CheckEnvironment.isDevKindMode) {
    baseUrl = `http://ipfs:8080/ipfs/${val}`;
  } else {
    baseUrl = `http://ipfs:8080/ipfs/${val}`;
  }
  return baseUrl;
};

const getValidHttpUrl = (_ipfsUrl) => {
  const validUrl = _ipfsUrl.replace(
    'ipfs://',
    getValidBaseUrl()
  );
  return validUrl;
};


module.exports = {
  getValidBaseUrl,
  getValidHttpUrl
}