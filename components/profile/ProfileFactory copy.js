import FilterPanel from '../FilterPanel';


export default function Wallet() {
  return (
    <>
			<div className="-p-2 -ml-2 rounded-lg shadow-lg bg-white">
				<FilterPanel></FilterPanel>
			</div>
			<div className="p-1 rounded-lg shadow-lg bg-white grow">
				<p className="text-gray-700 text-base">wallet</p>
			</div>
		</>
  )
}
