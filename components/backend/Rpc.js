const CheckEnvironment = require('@/components/CheckEnvironment');

const RPC = CheckEnvironment.isDevMode ? 'http://localhost:8545' : null;
console.log('RPC node:', RPC);

const getRpc = () => {
  switch(process.env.NEXT_PUBLIC_CHAIN_ID) {
    case '1337':
      return 'http://localhost:8545'
    default:
      return null
  }
};
console.log('process.env.NEXT_PUBLIC_CHAIN_ID', process.env.NEXT_PUBLIC_CHAIN_ID);
console.log('getRpc node:', getRpc());


module.exports = {
  RpcNode: RPC
}
