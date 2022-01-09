import axios from 'axios';

const API = axios.create({
	baseURL: '/api/'
});
const API_CANCEL = axios.CancelToken.source();


/***************************
******** API CALLs *********
****************************/

// ipfs
const ipfsUpload = payload => API.put(`ipfsUpload`, payload);

// cancel api call
const cancelApi = () => {
	API_CANCEL.cancel("Cancelling in cleanup");
};


const apis = {
	ipfsUpload,
	cancelApi
}

export default apis