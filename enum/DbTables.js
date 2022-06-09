export default {
  local: {
    mainnet: { user: 'local_user', collection: 'local_collection', asset: 'local_asset', contract: 'local_contract' },
    localhost: { user: 'user', collection: 'collection', asset: 'asset', contract: 'contract' }
  },
  ethereum: {
    mainnet: { user: 'ethereum_user', collection: 'ethereum_collection', asset: 'ethereum_asset', contract: 'ethereum_contract' },
    ropsten: { user: 'ropsten_user', collection: 'ropsten_collection', asset: 'ropsten_asset', contract: 'ropsten_contract' },
    rinkeby: { user: 'rinkeby_user', collection: 'rinkeby_collection', asset: 'rinkeby_asset', contract: 'rinkeby_contract' },
    goerli: { user: 'goerli_user', collection: 'goerli_collection', asset: 'goerli_asset', contract: 'goerli_contract' },
    kovan: { user: 'kovan_user', collection: 'kovan_collection', asset: 'kovan_asset', contract: 'kovan_contract' }
  },
  avalanche: {
    mainnet: { user: 'avax_user', collection: 'avax_collection', asset: 'avax_asset', contract: 'avax_contract' },
    testnet: { user: 'avax_test_user', collection: 'avax_test_collection', asset: 'avax_test_asset', contract: 'avax_test_contract' }
  },
  aurora: {
    mainnet: { user: 'aurora_user', collection: 'aurora_collection', asset: 'aurora_asset', contract: 'aurora_contract' },
    testnet: { user: 'aurora_test_user', collection: 'aurora_test_collection', asset: 'aurora_test_asset', contract: 'aurora_test_contract' },
    betanet: { user: 'aurora_beta_user', collection: 'aurora_beta_collection', asset: 'aurora_beta_asset', contract: 'aurora_beta_contract' }
  },
  fantom: {
    mainnet: { user: 'fantom_user', collection: 'fantom_collection', asset: 'fantom_asset', contract: 'fantom_contract' },
    testnet: { user: 'fantom_test_user', collection: 'fantom_test_collection', asset: 'fantom_test_asset', contract: 'fantom_test_contract' }
  },
  polygon: {
    mainnet: { user: 'polygon_user', collection: 'polygon_collection', asset: 'polygon_asset', contract: 'polygon_contract' },
    mumbai: { user: 'polygon_mumbai_user', collection: 'polygon_mumbai_collection', asset: 'polygon_mumbai_asset', contract: 'polygon_mumbai_contract' }
  },
  binance: {
    mainnet: { user: 'binance_user', collection: 'binance_collection', asset: 'binance_asset', contract: 'binance_contract' },
    testnet: { user: 'binance_test_user', collection: 'binance_test_collection', asset: 'binance_test_asset', contract: 'binance_test_contract' }
  }
};
