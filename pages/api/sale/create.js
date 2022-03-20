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
  const onChainData = await contract.getSale(Number(data.id));

  return (Number(data.id) === Number(onChainData.id) && Number(data.saleType) === onChainData.saleType);
};


export default async function handler(req, res) {
  const session = await getSession({ req })
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  // @todo This can only be run locally at the moment. Once deployed on testnet/mainnet, this needs to run
  if (!(await checkBlockchain(data))) return res.status(400).json({ 'error': 'record not found on blockchain' });

  // ensure if id already exists, we don't overwrite the record
  const payload = {
    TableName: "sales",
    Item: {
      'id': data.id,
      'contractAddress': ethers.utils.getAddress(data.contractAddress),
      'tokenId': Number(data.tokenId),
      'collectionId': Number(data.collectionId),
      'seller': ethers.utils.getAddress(data.seller),
      'buyer': ethers.utils.getAddress(data.buyer),
      'price': Number(data.price),
      'sold': false,
      'saleType': Number(data.saleType),
      'category': data.category,
      'active': 1
    },
    ExpressionAttributeNames: { '#id': 'id' },
    ExpressionAttributeValues: { ':id': data.id },
    ConditionExpression: "#id <> :id"
  };
  await DynamoDbQuery.item.put(payload);

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
