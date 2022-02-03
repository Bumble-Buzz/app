
export default function ButtonWrapper({ ...props }) {
  // extract classes from props
  let classes = '';
  if (props.classes) {
    classes = props.classes;
    props = Object.fromEntries(Object.entries(props).filter(([key]) => !key.includes('classes')));
  }
  return (
    <input
      type="text"
      autoComplete="off"
      placeholder=""
      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm border-gray-300 rounded-md ${classes}`}
      {...props}
    />
  );
}
