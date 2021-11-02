
const getValidHttpUrl = (_ipfsUrl) => {
  const validUrl = _ipfsUrl.replace(
    'ipfs://',
    `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/`
  );
  return validUrl;
};


module.exports = {
  getValidHttpUrl
}