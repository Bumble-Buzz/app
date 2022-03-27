import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';


const buildData = ({ chartData }) => ({
    labels: chartData.labels,
    datasets: [ 
        {
            label: 'asdsad',
            data: chartData.data,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 1)',
            pointBackgroundColor: 'rgba(255, 255, 255, 1)',
            fill: 'start',
            tension: 0.4,
        },
    ],
});

const options = {
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
  }
};

const dataInit = {
  labels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May' ],
  datasets: [
    {
      // label: 'Sales 2020 (M)',
      data: [2,4.123,1,0,5],
    }
  ]
};

const StockChart = ({ info }) => {
    const data = buildData(info);

    return (
        <>
          <Line type="line" data={dataInit} options={options} />
        </>
    );
};

export default StockChart;