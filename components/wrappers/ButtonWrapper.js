
export default function ButtonWrapper({ children, ...props }) {
  // extract classes from props
  let classes = '';
  if (props.classes) {
    classes = props.classes;
    props = Object.fromEntries(Object.entries(props).filter(([key]) => !key.includes('classes')));
  }
  return (
    <button
      type="button"
      className={`py-2 px-4 inline-flex justify-center items-center content-center border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${classes}`}
      {...props}
    >
      {children}
    </button>
  );
}
