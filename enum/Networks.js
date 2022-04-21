
const _getLocalNetworks = () => {
  return {
    mainnet: { name: 'Local', id: 1337, currency: 'ETH' }
  }
};

const _getEhereumNetworks = () => {
  return {
    mainnet: { name: 'Ethereum', id: 1, currency: 'ETH' },
    ropsten: { name: 'Ropsten', id: 3, currency: 'ETH' },
    rinkeby: { name: 'Rinkeby', id: 4, currency: 'ETH' },
    goerli: { name: 'Goerli', id: 5, currency: 'ETH' },
    kovan: { name: 'Kovan', id: 42, currency: 'ETH' }
  }
};

const _getAvalancheNetworks = () => {
  return {
    mainnet: { name: 'Avalanche', id: 43114, currency: 'AVAX' },
    testnet: { name: 'Avalanche Testnet', id: 43113, currency: 'AVAX' }
  }
};

const _getAuroraNetworks = () => {
  return {
    mainnet: { name: 'Aurora', id: 1313161554, currency: 'ETH' },
    testnet: { name: 'Aurora Testnet', id: 1313161555, currency: 'ETH' },
    betanet: { name: 'Aurora Betanet', id: 1313161556, currency: 'ETH' }
  }
};

const _getFantomNetworks = () => {
  return {
    mainnet: { name: 'Fantom', id: 250, currency: 'FTM' },
    testnet: { name: 'Fantom Testnet', id: 4002, currency: 'FTM' }
  }
};

const _getPolygonNetworks = () => {
  return {
    mainnet: { name: 'Polygon', id: 137, currency: 'MATIC' },
    mumbai: { name: 'Polygon Mumbai', id: 80001, currency: 'MATIC' }
  }
};

const _getBinanceNetworks = () => {
  return {
    mainnet: { name: 'Binance', id: 56, currency: 'BNB' },
    testnet: { name: 'Binance Testnet', id: 97, currency: 'BNB' }
  }
};


const getNetworkById = (_id) => {
  // local
  if (_id === 1337) return _getLocalNetworks().mainnet;
  // ethereum
  if (_id === 1) return _getEhereumNetworks().mainnet;
  if (_id === 3) return _getEhereumNetworks().ropsten;
  if (_id === 4) return _getEhereumNetworks().rinkeby;
  if (_id === 5) return _getEhereumNetworks().goerli;
  if (_id === 42) return _getEhereumNetworks().kovan;
  // avalanche
  if (_id === 43114) return _getAvalancheNetworks().mainnet;
  if (_id === 43113) return _getAvalancheNetworks().testnet;
  // aurora
  if (_id === 1313161554) return _getAuroraNetworks().mainnet;
  if (_id === 1313161555) return _getAuroraNetworks().testnet;
  if (_id === 1313161556) return _getAuroraNetworks().betanet;
  // fantom
  if (_id === 250) return _getFantomNetworks().mainnet;
  if (_id === 4002) return _getFantomNetworks().testnet;
  // polygon
  if (_id === 137) return _getPolygonNetworks().mainnet;
  if (_id === 80001) return _getPolygonNetworks().mumbai;
  // binance
  if (_id === 56) return _getBinanceNetworks().mainnet;
  if (_id === 97) return _getBinanceNetworks().testnet;
};

export default {
  getNetworkById,
  local: _getLocalNetworks(),
  ethereum: _getEhereumNetworks(),
  avalanche: _getAvalancheNetworks(),
  aurora: _getAuroraNetworks(),
  fantom: _getFantomNetworks(),
  polygon: _getPolygonNetworks(),
  binance: _getBinanceNetworks()
};
