import General from './General';
import Wallet from './Wallet';
import Collections from './Collections';
import Created from './created/Created';
import Listings from './listings/Listings';
import Admin from './admin/Admin';


module.exports = {
  general: props => <General {...props} />,
  wallet: props => <Wallet {...props} />,
  collections: props => <Collections {...props} />,
  created: props => <Created {...props} />,
  listings: props => <Listings {...props} />,
  admin: props => <Admin {...props} />
}
