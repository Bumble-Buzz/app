import { useState } from 'react'
import Content1 from './content1';
import Content2 from './content2';
import Content3 from './content3';

export default function Content({ id }) {
	if (id == 1) {
		return (
			<div className="mt-2 py-2 text-left">
				<Content1 />
			</div>
		)
	} else if (id == 2) {
		return (
			<div className="mt-2 py-2 text-left">
				<Content2 />
			</div>
		)
	} else if (id == 3) {
		return (
			<div className="mt-2 py-2 text-left">
				<Content3 />
			</div>
		)
	} else {
		return (
			<div className="mt-2 py-2 text-left">
				<Content1 />
			</div>
		)
	}
}
  