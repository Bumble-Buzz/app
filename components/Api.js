import axios from 'axios';

const API = axios.create({
	baseURL: '/api/'
});
const API_CANCEL = axios.CancelToken.source();


/***************************
******** API CALLs *********
****************************/

// ipfs
const ipfsImage = payload => API.put(`ipfs/image`, payload);
const ipfsConfig = payload => API.put(`ipfs/config`, payload);

// dynamo database
const listTable = payload => API.put(`db/listTables`, payload);

// cancel api call
const cancelApi = () => {
	API_CANCEL.cancel("Cancelling in cleanup");
};


const apis = {
	ipfsImage,
	ipfsConfig,
	listTable,
	cancelApi
}

export default apis