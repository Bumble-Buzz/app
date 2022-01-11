import { toast } from 'react-toastify';


const props = {
  position: toast.POSITION.TOP_CENTER
};


const info = (message) => {
	toast.info(message, props);
};

const success = (message) => {
	toast.success(message, props);
};

const warn = (message) => {
	toast.warn(message, props);
};

const error = (message) => {
	toast.error(message, props);
};


const notifications = {
	info,
  success,
  warn,
  error
}

export default notifications