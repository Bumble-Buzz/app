import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import { RpcNode } from '@/components/backend/Rpc';
import SaleAbi from '@/artifacts/contracts/sale/Sale.sol/Sale.json';
import IERC721Abi from '@/artifacts/@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json';


/**
 * @todo If we are unable to verify data on blockchain, then we need to be more creative.
 * We will need to use the databse to make sure when a collection is active, no one can modify it's main keys except
 * for the owner, or the admin.
**/
const checkBlockchainSale = async (data) => {
  if (!RpcNode) { console.log('skipping blockchain check'); return true; }

  const provider = new ethers.providers.JsonRpcProvider(RpcNode);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_SALE_CONTRACT_ADDRESS, SaleAbi.abi, provider);
  const onChainData = await contract.getSale(Number(data.saleId));

  return (Number(data.saleId) === Number(onChainData.id) && Number(data.saleType) === onChainData.saleType);
};

export default async function handler(req, res) {
  const session = await getSession({ req });
  const data = req.body;
  // console.log('req.body', data);

  // check parameters
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });
  if (!data.contractAddress) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!data.owner) return res.status(400).json({ 'error': 'invalid request parameters' });

  const formattedContract = ethers.utils.getAddress(data.contractAddress);
  const formattedTokenId = Number(data.tokenId);
  const formattedSaleId = Number(data.saleId);
  const formattedOwner = ethers.utils.getAddress(data.owner);

  if (!data.tokenId || !Number.isInteger(formattedTokenId)) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!data.saleId || !Number.isInteger(formattedSaleId)) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (session.user.id !== formattedOwner) return res.status(401).json({ 'error': 'not authenticated' });
  
  // @todo This can only be run locally at the moment. Once deployed on testnet/mainnet, this needs to run
  if (!(await checkBlockchainSale(data))) return res.status(400).json({ 'error': 'market sale exists' });


  const payload = {
    TableName: "asset",
    Key: { 'contractAddress': formattedContract, 'tokenId': formattedTokenId },
    ExpressionAttributeNames: { "#onSale": "onSale", "#saleId": "saleId", "#price": "price", "#saleType": "saleType", "#category": "category" },
    ExpressionAttributeValues: { ":onSale": Number(1), ":saleId": data.saleId, ":price": data.price, ":saleType": data.saleType, ":category": data.category },
    UpdateExpression: `set #onSale = :onSale, #saleId = :saleId, #price = :price, #saleType = :saleType, #category = :category`
  };
  const results = await DynamoDbQuery.item.update(payload);
  const {Items, LastEvaluatedKey, Count, ScannedCount} = results;

  res.status(200).json({ Items, LastEvaluatedKey, Count, ScannedCount });
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