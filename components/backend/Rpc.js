// const CheckEnvironment = require('@/components/CheckEnvironment');

// const RPC = CheckEnvironment.isDevMode ? 'http://localhost:8545' : null;
// console.log('RPC node:', RPC);

const getRpc = () => {
  switch(process.env.NEXT_PUBLIC_CHAIN_ID) {
    case '1337':
      return 'http://localhost:8545'
      case '3':
        return process.env.ROPSTEN_ETH
      case '1313161554':
      return process.env.INFURA_AURORA
      case '1313161555':
      return process.env.INFURA_AURORA_TESTNET
    default:
      return null
  }
};
console.log('process.env.NEXT_PUBLIC_CHAIN_ID', process.env.NEXT_PUBLIC_CHAIN_ID);
console.log('getRpc node:', getRpc());


module.exports = {
  RpcNode: getRpc()
}
