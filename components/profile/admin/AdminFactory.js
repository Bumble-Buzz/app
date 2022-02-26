import General from './General';
import Collections from './collections/Collections';


module.exports = {
  general: props => <General {...props} />,
  collections: props => <Collections {...props} />
}
