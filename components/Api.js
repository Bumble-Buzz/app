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

// cancel api call
const cancelApi = () => {
	API_CANCEL.cancel("Cancelling in cleanup");
};


const apis = {
	ipfsImage,
	ipfsConfig,
	cancelApi
}

export default apis