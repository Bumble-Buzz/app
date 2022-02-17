import Wallet from './Wallet';
import Collections from './Collections';
import Created from './Created';
import Listings from './Listings';


module.exports = {
  wallet: props => <Wallet {...props} />,
  collections: props => <Collections {...props} />,
  created: props => <Created {...props} />,
  listings: props => <Listings {...props} />
}
