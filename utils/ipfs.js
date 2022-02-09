import CheckEnvironment from '../components/CheckEnvironment';


const getValidBaseUrl = () => {
  let baseUrl;
  if (CheckEnvironment.isDevMode) {
    baseUrl = "http://localhost:8080/ipfs/";
  } else if (CheckEnvironment.isDevKindMode) {
    baseUrl = "http://ipfs:8080/ipfs/";
  } else {
    baseUrl = "http://ipfs:8080/ipfs/";
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