import DB_TABLES from '@/enum/DbTables';

const _getLocalNetworks = () => {
  return {
    mainnet: { name: 'Local', id: 1337, currency: 'ETH', tables: DB_TABLES.local.mainnet },
    localhost: { name: 'Local', id: 1337, currency: 'ETH', tables: DB_TABLES.local.localhost }
  }
};

const _getEthereumNetworks = () => {
  return {
    mainnet: { name: 'Ethereum', id: 1, currency: 'ETH', tables: DB_TABLES.ethereum.mainnet },
    ropsten: { name: 'Ropsten', id: 3, currency: 'ETH', tables: DB_TABLES.ethereum.ropsten },
    rinkeby: { name: 'Rinkeby', id: 4, currency: 'ETH', tables: DB_TABLES.ethereum.rinkeby },
    goerli: { name: 'Goerli', id: 5, currency: 'ETH', tables: DB_TABLES.ethereum.goerli },
    kovan: { name: 'Kovan', id: 42, currency: 'ETH', tables: DB_TABLES.ethereum.kovan }
  }
};

const _getAvalancheNetworks = () => {
  return {
    mainnet: { name: 'Avalanche', id: 43114, currency: 'AVAX', tables: DB_TABLES.avalanche.mainnet },
    testnet: { name: 'Avalanche Testnet', id: 43113, currency: 'AVAX', tables: DB_TABLES.avalanche.testnet }
  }
};

const _getAuroraNetworks = () => {
  return {
    mainnet: { name: 'Aurora', id: 1313161554, currency: 'ETH', tables: DB_TABLES.aurora.mainnet },
    testnet: { name: 'Aurora Testnet', id: 1313161555, currency: 'ETH', tables: DB_TABLES.aurora.testnet },
    betanet: { name: 'Aurora Betanet', id: 1313161556, currency: 'ETH', tables: DB_TABLES.aurora.betanet }
  }
};

const _getFantomNetworks = () => {
  return {
    mainnet: { name: 'Fantom', id: 250, currency: 'FTM', tables: DB_TABLES.fantom.mainnet },
    testnet: { name: 'Fantom Testnet', id: 4002, currency: 'FTM', tables: DB_TABLES.fantom.testnet }
  }
};

const _getPolygonNetworks = () => {
  return {
    mainnet: { name: 'Polygon', id: 137, currency: 'MATIC', tables: DB_TABLES.polygon.mainnet },
    mumbai: { name: 'Polygon Mumbai', id: 80001, currency: 'MATIC', tables: DB_TABLES.polygon.mumbai }
  }
};

const _getBinanceNetworks = () => {
  return {
    mainnet: { name: 'Binance', id: 56, currency: 'BNB', tables: DB_TABLES.binance.mainnet },
    testnet: { name: 'Binance Testnet', id: 97, currency: 'BNB', tables: DB_TABLES.binance.testnet }
  }
};


const getNetworkById = (_id) => {
  // local
  if (_id === 1337) return _getLocalNetworks().mainnet;
  // if (_id === 1337) return _getLocalNetworks().localhost;
  // ethereum
  if (_id === 1) return _getEthereumNetworks().mainnet;
  if (_id === 3) return _getEthereumNetworks().ropsten;
  if (_id === 4) return _getEthereumNetworks().rinkeby;
  if (_id === 5) return _getEthereumNetworks().goerli;
  if (_id === 42) return _getEthereumNetworks().kovan;
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
  ethereum: _getEthereumNetworks(),
  avalanche: _getAvalancheNetworks(),
  aurora: _getAuroraNetworks(),
  fantom: _getFantomNetworks(),
  polygon: _getPolygonNetworks(),
  binance: _getBinanceNetworks()
};
