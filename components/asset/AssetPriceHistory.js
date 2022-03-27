import { useEffect } from 'react/cjs/react.production.min';
import StockChart from '@/components/asset/stockChart';
import NumberFormatter from '@/utils/NumberFormatter';
import { CHAIN_ICONS } from '@/enum/ChainIcons';
import Chart from 'chart.js';


export default function AssetPriceHistory({ initialData, classes }) {

  const data = {
    chartData: {
      labels: [
        "10:00",
        "",
        "",
        "",
        "12:00",
        "",
        "",
        "",
        "2:00",
        "",
        "",
        "",
        "4:00",
      ],
      data: [
        2.23,
        2.215,
        2.22,
        2.25,
        2.245,
        2.27,
        2.28,
        2.29,
        2.3,
        2.29,
        2.325,
        2.325,
        2.32,
      ],
    },
  };

  return (
    <>
      {/* <p>inside AssetPriceHistory</p> */}
      {/* <canvas id='chart' /> */}
      <StockChart info={data} />
    </>
  )
}
