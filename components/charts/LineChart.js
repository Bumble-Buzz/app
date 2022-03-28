import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import NumberFormatter from '@/utils/NumberFormatter';
import Date from '@/utils/Date';


export default function LineChart({ chartData }) {

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleAlign: 'center',
        bodyAlign: 'center',
        displayColors: false,
        callbacks: {
          title: (context) => {
            const currentContext = context[0];
            const timestamp = chartData.timestamp[currentContext.dataIndex];
            return Date.getLongDate(timestamp);
          },
          label: (context) => {
            const price = NumberFormatter(Number(context.formattedValue), 'decimal', { maximumFractionDigits: 2 });
            return `Price: ${price}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'ETH' },
        max: Math.max(...chartData.datasets[0].data) * 1.2,
        min: 0
      },
      x: {
        title: { display: true, text: 'Date' },
        offset: true
      }
    }
  };

  return (
    <Line type="line" data={chartData} options={options} />
  );
};
