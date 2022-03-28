import LineChart from '@/components/charts/LineChart';


export default function AssetPriceHistory({ type, initialData }) {

  const chartData = {
    labels: [...initialData.priceHistory.label],
    datasets: [
      { data: [...initialData.priceHistory.ethPrice] }
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
