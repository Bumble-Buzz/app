export default {
  local: {
    mainnet: { name: 'local', id: 1337, currency: 'ETH' }
  },
  ethereum: {
    mainnet: { name: 'ethereum', id: 1, currency: 'ETH' },
    ropsten: { name: 'ropsten', id: 3, currency: 'ETH' },
    rinkeby: { name: 'rinkeby', id: 4, currency: 'ETH' },
    goerli: { name: 'goerli', id: 5, currency: 'ETH' },
    kovan: { name: 'kovan', id: 42, currency: 'ETH' }
  },
  binance: {
    mainnet: { name: 'binance', id: 56, currency: 'BNB' },
    testnet: { name: 'testnet', id: 97, currency: 'BNB' }
  },
  avalanche: {
    mainnet: { name: 'avalanche', id: 43114, currency: 'AVAX' },
    testnet: { name: 'testnet', id: 43113, currency: 'AVAX' }
  },
  aurora: {
    mainnet: { name: 'aurora', id: 1313161554, currency: 'ETH' },
    testnet: { name: 'testnet', id: 1313161555, currency: 'ETH' },
    betanet: { name: 'betanet', id: 1313161556, currency: 'ETH' }
  },
  fantom: {
    mainnet: { name: 'fantom', id: 250, currency: 'FTM' },
    testnet: { name: 'testnet', id: 4002, currency: 'FTM' }
  },
  polygon: {
    mainnet: { name: 'polygon', id: 137, currency: 'MATIC' },
    mumbai: { name: 'mumbai', id: 80001, currency: 'MATIC' }
  }
};
