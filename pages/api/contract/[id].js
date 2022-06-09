import Cors from 'cors';
import { ethers } from 'ethers';
import DynamoDbQuery from '@/components/backend/db/DynamoDbQuery';
import ENUM from '@/enum/ENUM';


export default async function handler(req, res) {
  const { id, networkId } = req.query
  // console.log('api param:', id);

  //check params
  if (!id) return res.status(400).json({ error: `contract address is invalid` });

  const contractAddress = ethers.utils.getAddress(id);

  let formattedNetworkId = Number(networkId);
  if (!formattedNetworkId || formattedNetworkId <= 0) formattedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  const network = ENUM.NETWORKS.getNetworkById(formattedNetworkId);

  let payload = {
    TableName: network.tables.contract,
    Key: { 'contractAddress': contractAddress }
  };
  let results = await DynamoDbQuery.item.get(payload);
  const {Item, ConsumedCapacity} = results;

  res.status(200).json({ Item, ConsumedCapacity });
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
