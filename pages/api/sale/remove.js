import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import { RpcNode } from '@/components/backend/Rpc';
import SaleAbi from '@/artifacts/contracts/sale/Sale.sol/Sale.json';


/**
 * @todo If we are unable to verify data on blockchain, then we need to be more creative.
 * We will need to use the databse to make sure when a collection is active, no one can modify it's main keys except
 * for the owner, or the admin.
**/
const checkBlockchain = async (data) => {
  if (!RpcNode) { console.log('skipping blockchain check'); return true; }

  const provider = new ethers.providers.JsonRpcProvider(RpcNode);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_SALE_CONTRACT_ADDRESS, SaleAbi.abi, provider);

  let returnValue = false;
  try {
    await contract.getSale(data.saleId);
  } catch(e) {
    if (e.error.body.includes('The sale does not exist')) {
      returnValue = true;
    }
  }
  return returnValue;
};


export default async function handler(req, res) {
  const session = await getSession({ req });
  const data = req.body;
  console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!data.contractAddress) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!Number.isInteger(Number(data.tokenId))) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!Number.isInteger(Number(data.saleId))) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });
  
  // @todo This can only be run locally at the moment. Once deployed on testnet/mainnet, this needs to run
  if (!(await checkBlockchain(data))) return res.status(400).json({ 'error': 'record not found on blockchain' });

  const formattedContract = ethers.utils.getAddress(data.contractAddress);
  const formattedTokenId = Number(data.tokenId);
  
  const payload = {
    TableName: "sale",
    Key: { 'contractAddress': formattedContract, 'tokenId': formattedTokenId }
  };
  await DynamoDbQuery.item.delete(payload);

  res.status(200).json({ 'status': 'success' });
};


// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
});
    
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })

    
  })
};
