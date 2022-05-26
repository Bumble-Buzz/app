import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import API from '@/components/Api';
import WalletUtil from '@/components/wallet/WalletUtil';
import ButtonWrapper from '@/components/wrappers/ButtonWrapper';
import InputWrapper from '@/components/wrappers/InputWrapper';
import HeadlessDialog from '@/components/HeadlessDialog';
import Toast from '@/components/Toast';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';

import CollectionItemAbi from '@/artifacts/contracts/collectionItem/CollectionItem.sol/CollectionItem.json';


const IDENTIFIER = 'incentive_percent';
const DIALOG = { title: '', content: () => {} };

export default function IncentivePercent({ isLoading, setLoading, account, setAccount, collection }) {
  let dbTriggered = false;
  const [blockchainResults, setBlockchainResults] = useState(null);
  const [isDialog, setDialog] = useState(false);

  useEffect(() => {
    (async () => {
      if (!blockchainResults || dbTriggered) return;

      try {
        const payload = {
          'id': Number(blockchainResults.id),
          'name': collection.name,
          'contractAddress': ethers.utils.getAddress(collection.contractAddress),
          'owner': collection.owner,
          'description': collection.description,
          'reflection': Number(collection.reflection),
          'commission': Number(collection.commission),
          'incentive': Number(blockchainResults.incentive),
          'ownerIncentiveAccess': collection.ownerIncentiveAccess,
          'category': collection.category,
          'image': collection.image,
          'social': collection.social
        };
        await API.collection.update.id(blockchainResults.id, payload)

        const incentivePercent = blockchainResults.incentive > 0 ? blockchainResults.incentive/100 : blockchainResults.incentive;
        setAccount(incentivePercent);
        setLoading(null);
        setBlockchainResults(null);
      } catch (e) {
        console.error('e', e);
        Toast.error(e.message);
        setLoading(null);
      }
    })();
  }, [blockchainResults]);

  const percentUpdate = async (e, _value) => {
    e.preventDefault();

    try {
      setLoading(IDENTIFIER);
      setDialog(false);

      const signer = await WalletUtil.getWalletSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTION_ITEM_CONTRACT_ADDRESS, CollectionItemAbi.abi, signer);

      const listener = async (id) => {
        console.log('found collection update event: ', id.toNumber());
        if (!dbTriggered && collection.id === Number(id)) {
          dbTriggered = true;
          setBlockchainResults({ id: collection.id, incentive: _value });
          contract.off("onCollectionUpdate", listener);
        }
      };
      contract.on("onCollectionUpdate", listener);

      // update collection in blockchain
      const transaction = await contract.updateCollection(
        collection.id, collection.reflection, collection.commission, _value, collection.owner
      );
      await transaction.wait();
    } catch (e) {
      console.error('e', e);
      Toast.error(e.message);
      setLoading(null);
    }
  };
  const update = async (e) => {
    e.preventDefault();

    DIALOG.title = 'Update collection incentive percent';
    DIALOG.content = () => (<Action action={percentUpdate} />);
    setDialog(true);
  };

  return (
    <>
      {isLoading && (isLoading === IDENTIFIER) && (
        <ButtonWrapper disabled type="submit">
          <DotsCircleHorizontalIcon className="animate-spin w-5 h-5 mr-2" aria-hidden="true" />Processing
        </ButtonWrapper>
      )}
      {isLoading && isLoading !== IDENTIFIER && (<>
        <ButtonWrapper disabled classes='bg-indigo-500 hover:bg-indigo-700 gap-x-1 items-center'>Update</ButtonWrapper>
      </>)}
      {!isLoading && (<>
        <ButtonWrapper classes='px-1 py-1' onClick={update}>Update</ButtonWrapper>
      </>)}
      <HeadlessDialog open={isDialog} setOpen={setDialog} title={DIALOG.title} content={DIALOG.content()} />
    </>
  )
}

const Action = ({ action }) => {
  const [input, setInput] = useState('');
  return (
    <form onSubmit={(e) => action(e, input)}>
      <div className="flex flex-col items-center px-4 py-4 gap-2 bg-white">
        <InputWrapper
          type="number"
          id="incentive-withdraw"
          min="0"
          max="99"
          step="any"
          name="incentive-withdraw"
          aria-label="incentive-withdraw"
          aria-describedby="incentive-withdraw"
          classes="w-full"
          value={input}
          onChange={(e) => setInput(Number(e.target.value))}
        />
        <ButtonWrapper type="submit" classes='px-1 py-1 w-full'>Update</ButtonWrapper>
      </div>
    </form>
  )
};
