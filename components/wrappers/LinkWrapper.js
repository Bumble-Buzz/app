import Link from 'next/link';

export default function LinkWrapper({ children, link, linkText, onClick, ...props }) {
  // extract classes from props
  let classes = '';
  if (props.classes) {
    classes = props.classes;
    props = Object.fromEntries(Object.entries(props).filter(([key]) => !key.includes('classes')));
  }
  return (
    <Link
      href={link}
      passHref={true}
      {...props}
    >
      <a className={`text-blue-500 ${classes}`} onClick={onClick}>{linkText}</a>
    </Link>
  );
}
