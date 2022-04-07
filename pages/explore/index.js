import API from '@/components/Api';
import ContentWrapper from '@/components/wrappers/ContentWrapper';
import ExploreContent from '@/components/explore/ExploreContent';


const BATCH_SIZE = 20;


export default function Explore({ assetDataInit }) {

  const getSales = async () => {
    // const arr = getRandomBatch();
    setExclusiveStartKey(rawSaleIds.LastEvaluatedKey);
    const payload = { ids: rawSaleIds.Items };
    const {data} = await API.asset.batch(payload);
    setAssets(data.Items);
    setFilteredAssets(data.Items);
    setLoading(false);
  };

  const getRandomBatch = () => {
    const rawSaleIdsLength = rawSaleIds.Items.length;
    let batchSize = BATCH_SIZE;
    if (batchSize > rawSaleIdsLength) batchSize = rawSaleIdsLength;

    let randomArray = [];
    for (let i = 0; i < batchSize; i++) {
      const rand = Math.floor(Math.random() * rawSaleIdsLength);

      randomArray.push(rawSaleIds.Items[rand]);
      rawSaleIds.Items[rand] = rawSaleIds.Items[rawSaleIdsLength-1];
      rawSaleIds.Items.pop();
    }
    return randomArray;
  };


  return (
    <ContentWrapper>

    {/* <div className='flex flex-col'>
      <p onClick={() => console.log(searching)}>searching</p>
      <p onClick={() => console.log(rawSaleIds)}>rawSaleIds</p>
      <p onClick={() => console.log(assets)}>assets</p>
      <p onClick={() => console.log(filteredAssets)}>filteredAssets</p>
      <p onClick={() => console.log(apiSortKey)}>apiSortKey</p>
      <p onClick={() => console.log(exclusiveStartKey)}>exclusiveStartKey</p>
    </div> */}

      {/* Page Content */}
      <div className='flex flex-col w-full items-center'>

        <div className='gap-2 flex flex-col w-full'>
          <ExploreContent initialData={assetDataInit} />
        </div>

      </div>
    </ContentWrapper>
  )
}

export async function getServerSideProps() {
  const { data } = await API.backend.asset.sale.all('null', 'null', 'null', BATCH_SIZE);
  return {
    props: {
      assetDataInit: data
    }
  }
}
