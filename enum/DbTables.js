export default {
  local: {
    mainnet: { user: 'local_user', collection: 'local_collection', asset: 'local_asset' },
    localhost: { user: 'user', collection: 'collection', asset: 'asset' }
  },
  ethereum: {
    mainnet: { user: 'ethereum_user', collection: 'ethereum_collection', asset: 'ethereum_asset' },
    ropsten: { user: 'ropsten_user', collection: 'ropsten_collection', asset: 'ropsten_asset' },
    rinkeby: { user: 'rinkeby_user', collection: 'rinkeby_collection', asset: 'rinkeby_asset' },
    goerli: { user: 'goerli_user', collection: 'goerli_collection', asset: 'goerli_asset' },
    kovan: { user: 'kovan_user', collection: 'kovan_collection', asset: 'kovan_asset' }
  },
  avalanche: {
    mainnet: { user: 'avax_user', collection: 'avax_collection', asset: 'avax_asset' },
    testnet: { user: 'avax_test_user', collection: 'avax_test_collection', asset: 'avax_test_asset' }
  },
  aurora: {
    mainnet: { user: 'aurora_user', collection: 'aurora_collection', asset: 'aurora_asset' },
    testnet: { user: 'aurora_test_user', collection: 'aurora_test_collection', asset: 'aurora_test_asset' },
    betanet: { user: 'aurora_beta_user', collection: 'aurora_beta_collection', asset: 'aurora_beta_asset' }
  },
  fantom: {
    mainnet: { user: 'fantom_user', collection: 'fantom_collection', asset: 'fantom_asset' },
    testnet: { user: 'fantom_test_user', collection: 'fantom_test_collection', asset: 'fantom_test_asset' }
  },
  polygon: {
    mainnet: { user: 'polygon_user', collection: 'polygon_collection', asset: 'polygon_asset' },
    mumbai: { user: 'polygon_mumbai_user', collection: 'polygon_mumbai_collection', asset: 'polygon_mumbai_asset' }
  },
  binance: {
    mainnet: { user: 'binance_user', collection: 'binance_collection', asset: 'binance_asset' },
    testnet: { user: 'binance_test_user', collection: 'binance_test_collection', asset: 'binance_test_asset' }
  }
};
