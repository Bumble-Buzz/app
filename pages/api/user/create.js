import Cors from 'cors';
import { ethers } from 'ethers';
import { getSession } from "next-auth/react";
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import Date from '@/utils/Date';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const session = await getSession({ req });
  const data = req.body;
  // console.log('req.body', data);

  //check params
  if (!data) return res.status(400).json({ 'error': 'invalid request parameters' });
  if (!session) return res.status(401).json({ 'error': 'not authenticated' });

  const formattedWalletId = ethers.utils.getAddress(data.id);

  if (session.user.id !== formattedWalletId) return res.status(401).json({ 'error': 'not authenticated' });

  let networkId = Number(data.networkId);
  if (!networkId || networkId <= 0) networkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(networkId);

  const payload = {
    TableName: network.tables.user,
    Item: {
      'walletId': formattedWalletId,
      'name': 'Anon',
      'bio': '',
      'picture': '',
      'notifications': [],
      'timestamp': Date.getTimestamp().toString()
    },
    ExpressionAttributeNames: { '#walletId': 'walletId' },
    ExpressionAttributeValues: { ':walletId': formattedWalletId },
    ConditionExpression: "#walletId <> :walletId"
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
