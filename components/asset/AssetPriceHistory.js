import LineChart from '@/components/charts/LineChart';

const data = {
  labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May' ],
  datasets: [
    {
      // label: 'Sales 2020 (M)',
      data: [2,4.123,1,0,5],
    }
  ]
};

export default function AssetPriceHistory({ type, initialData }) {
  console.log('initialData', initialData);

  const data = {
    labels: initialData.priceHistory.timestamp,
    datasets: [
      {
        data: initialData.priceHistory.ethPrice
      }
    ]
  };

  switch(type) {
    case 'line':
      return (<LineChart data={data} />)
    default:
      return (<LineChart data={data} />)
  }
}
