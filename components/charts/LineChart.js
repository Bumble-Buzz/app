import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


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
        // title: (context) => {
        //   return 'fill date here';
        // },
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
      min: 0
    },
    x: {
      title: { display: true, text: 'Date' },
    }
  }
};



export default function LineChart({ data }) {
  console.log('data', data);

  return (
    <Line type="line" data={data} options={options} />
  );
};
