import General from './general/General';
import Wallet from './wallet/Wallet';
import Collections from './collections/Collections';
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
