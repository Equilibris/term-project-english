import '../styles/globals.scss'
import '@animxyz/core'

import { AppProps } from 'next/app'
import { useEffect, useState, useRef } from 'react'
import { useCounter, useInterval } from 'react-use'

import { slideContext } from 'client/context/slide'

function MyApp({ Component, pageProps }: AppProps) {
	const [counter, { inc }] = useCounter(0, Infinity, -1)
	useInterval(inc, 1000)

	const [slide, setSlide] = useState(0)
	const body = useRef<HTMLBodyElement>(null)

	useEffect(() => {
		if (body.current === null)
			body.current = document.getElementsByTagName('body').item(0)
		window.onkeypress = (ev: KeyboardEvent) => {
			if ((ev.target as HTMLElement) === body.current) {
				if (ev.key === ' ') setSlide(slide + 2 * (1 - +ev.shiftKey) - 1)
			}
		}
	}, [slide])

	return (
		<slideContext.Provider value={slide}>
			<head>
				<link
					rel='stylesheet'
					href='https://highlightjs.org/static/demo/styles/atom-one-dark.css'
				/>
			</head>
			<main>
				<Component {...pageProps} />
			</main>
			<div className='meta-data'>
				<div className='spinner' />
				<div className='time-meta'>
					{counter === 260
						? 'nice'
						: `${`${Math.floor(counter / 60)}`.padStart(2, '0')}:${`${
								counter % 60
						  }`.padStart(2, '0')}`}
				</div>
			</div>
			<div className='progress'>
				<div style={{ width: `${(101 * (1 + slide)) / 30}vw` }}></div>
			</div>
		</slideContext.Provider>
	)
}

export default MyApp
