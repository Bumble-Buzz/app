import LineChart from '@/components/charts/LineChart';


export default function AssetPriceHistory({ type, initialData }) {

  if (!initialData || !initialData.priceHistory || !initialData.priceHistory.timestamp || initialData.priceHistory.timestamp.length === 0 ) {
    return (<p>No price history</p>)
  }

  const chartData = {
    labels: [...initialData.priceHistory.label],
    datasets: [
      { data: [...initialData.priceHistory.ethPrice], pointHitRadius: 20 }
    ],
    timestamp: [...initialData.priceHistory.timestamp],
    usdPrice: [...initialData.priceHistory.usdPrice]
  };

  switch(type) {
    case 'line':
      return (<LineChart chartData={chartData} />)
    default:
      return (<LineChart chartData={chartData} />)
  }
}
