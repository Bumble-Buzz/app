export default {
  local: {
    mainnet: { name: 'Local', id: 1337, currency: 'ETH' }
  },
  ethereum: {
    mainnet: { name: 'Ethereum', id: 1, currency: 'ETH' },
    ropsten: { name: 'Ropsten', id: 3, currency: 'ETH' },
    rinkeby: { name: 'Rinkeby', id: 4, currency: 'ETH' },
    goerli: { name: 'Goerli', id: 5, currency: 'ETH' },
    kovan: { name: 'Kovan', id: 42, currency: 'ETH' }
  },
  binance: {
    mainnet: { name: 'Binance', id: 56, currency: 'BNB' },
    testnet: { name: 'Testnet', id: 97, currency: 'BNB' }
  },
  avalanche: {
    mainnet: { name: 'Avalanche', id: 43114, currency: 'AVAX' },
    testnet: { name: 'Testnet', id: 43113, currency: 'AVAX' }
  },
  aurora: {
    mainnet: { name: 'Aurora', id: 1313161554, currency: 'ETH' },
    testnet: { name: 'Testnet', id: 1313161555, currency: 'ETH' },
    betanet: { name: 'Betanet', id: 1313161556, currency: 'ETH' }
  },
  fantom: {
    mainnet: { name: 'Fantom', id: 250, currency: 'FTM' },
    testnet: { name: 'Testnet', id: 4002, currency: 'FTM' }
  },
  polygon: {
    mainnet: { name: 'Polygon', id: 137, currency: 'MATIC' },
    mumbai: { name: 'mumbai', id: 80001, currency: 'MATIC' }
  }
};
