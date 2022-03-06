import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useState, forwardRef } from 'react';


export default function Tooltip({ children, text }) {
  // Will only render the `content` or `render` elements if the tippy is mounted to the DOM.
  // Replace <Tippy /> with <LazyTippy /> component and it should work the same.
  const LazyTippy = forwardRef((props, ref) => {
    const [mounted, setMounted] = useState(false);
  
    const lazyPlugin = {
      fn: () => ({
        onMount: () => setMounted(true),
        onHidden: () => setMounted(false),
      }),
    };
  
    const computedProps = {...props};
  
    computedProps.plugins = [lazyPlugin, ...(props.plugins || [])];
  
    if (props.render) {
      computedProps.render = (...args) => (mounted ? props.render(...args) : '');
    } else {
      computedProps.content = mounted ? props.content : '';
    }
  
    return <Tippy {...computedProps} ref={ref} />;
  });

  return (
    <LazyTippy content={text}>
      {children}
    </LazyTippy>
  )
}
