import { slideContext } from 'client/context/slide'
import { Masonry } from 'client/components/masonry'
import { Data } from './api/images'
import ImageCitation from 'client/components/sited-image'
import Head from 'next/head'
import Image from 'next/image'

import Highlight from 'react-highlight.js'

import { useCounter, useInterval } from 'react-use'
import { withRouter, NextRouter } from 'next/router'
import {
	Dispatch,
	FC,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { memo } from 'react'

interface WithRouterProps {
	router: NextRouter
}

const IdeaEnterArea: FC<{
	ideasAboutDyslexia: string[]
	isShown: boolean
	setIdeasAboutDyslexia: Dispatch<SetStateAction<string[]>>
}> = ({ ideasAboutDyslexia, setIdeasAboutDyslexia, isShown }) => {
	const input = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isShown && input.current) input.current.focus()
	}, [isShown])

	return (
		<div className='ideas-about-dyslexia'>
			<ul>
				{ideasAboutDyslexia.map((value, index) => (
					<li key={index} className='xyz-in' xyz='fade right-2'>
						{value}
					</li>
				))}
				{ideasAboutDyslexia.length < 11 ? (
					<div className='input'>
						<input
							type='text'
							placeholder='What do you think dyslexia does?'
							ref={input}
							onKeyDown={(ev) => {
								if (input.current) {
									if (ev.key === 'Backspace' && !input.current.value) {
										ideasAboutDyslexia.pop()
										setIdeasAboutDyslexia([...ideasAboutDyslexia])
									}
									if (
										ev.key === 'Enter' &&
										!input.current.value &&
										ideasAboutDyslexia.length
									)
										input.current.blur()
									if (ev.key === 'Enter' && input.current.value) {
										setIdeasAboutDyslexia([
											...ideasAboutDyslexia,
											input.current.value
												.replace(/^\s+|\s+$/g, '')
												.replace(/It[^\ws]/g, (x) =>
													x.replace('It', 'Dyslexia')
												)
												.replace(/([^\w]|^)it([^\ws]|$)/g, (x) =>
													x.replace('it', 'dyslexia')
												),
										])
										input.current.value = ''
									}
								}
							}}
						/>
					</div>
				) : (
					''
				)}
			</ul>
		</div>
	)
}

const IdeaVisualizerPage: FC<{
	ideasAboutDyslexia: string[]
}> = memo(({ ideasAboutDyslexia }) => {
	const [fetchResult, setFetchResult] = useState<Data>([])

	useEffect(() => {
		fetch(
			`/api/images?${ideasAboutDyslexia.map((x) => `term=${x}`).join('&')}`
		).then(async (result) => {
			setFetchResult(await result.json())
		})
	}, [ideasAboutDyslexia])

	useEffect(() => console.log(fetchResult), [fetchResult])

	if (fetchResult.length)
		return (
			<div className='translation-container'>
				<Masonry elementMaxWidth={300} gap={15}>
					{fetchResult.map(({ searchTerm, title, url }) => (
						<div className='card' key={url}>
							<div>
								<img src={url} alt={title} />
							</div>
							<h1>{title}</h1>
							<p>
								On the term <i>{searchTerm}</i>
								<br />
								from: <a href={url}>{new URL(url).host}</a>
							</p>
						</div>
					))}
				</Masonry>
			</div>
		)
	else
		return (
			<div className='loading-spinner'>
				<h1>
					<div />
					Loading results
				</h1>
			</div>
		)
})

const WrappedHighlight: FC = memo(({ children }) => (
	<div>
		<Highlight language='typescript'>{children}</Highlight>
	</div>
))

const CodeRenderer: FC<{ onSlide: number }> = ({ onSlide }) => {
	const slide = useContext(slideContext)
	const [count, { inc, set }] = useCounter(-Infinity)

	useInterval(inc, 1000)

	useEffect(() => {
		if (slide < onSlide) set(-Infinity)

		if (slide === onSlide) {
			console.log('setting counter from', count)
			set(-1)
		}
	}, [onSlide, slide])

	const xyzFrom = (slide: number) => (slide <= count ? 'xyz-in' : 'xyz-out')

	return (
		<div className='code' xyz='fade'>
			<div className={xyzFrom(0)} xyz='fade'>
				<WrappedHighlight>
					{`// Safe means no to horny
const google = new Scraper({ safe: true, puppeteer: { headless: true } })`}
				</WrappedHighlight>
			</div>
			<div className={xyzFrom(1)} xyz='fade'>
				<WrappedHighlight>{`
export type Data = Record<'searchTerm' | 'url' | 'title', string>[]`}</WrappedHighlight>
			</div>
			<div className={xyzFrom(2)} xyz='fade'>
				<WrappedHighlight>{`const ensureArray = <T>(input: T | T[]) =>
	Array.isArray(input) ? input : [input]
`}</WrappedHighlight>
			</div>
			<div className={xyzFrom(3)} xyz='fade'>
				<WrappedHighlight>{`// Serverless function
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {`}</WrappedHighlight>
			</div>
			<div className={xyzFrom(4)} xyz='fade'>
				<WrappedHighlight>{`	const searchResult: Record<string, Record<'title' | 'url', string>[]> = {}
	await Promise.all(
		ensureArray(req.query['term']).map(
			async (x) => (searchResult[x] = (await google.scrape(x, 100)) as any)
		)
	)
	const output: Data = []`}</WrappedHighlight>
			</div>
			<div className={xyzFrom(5)} xyz='fade'>
				<WrappedHighlight>{`	for (const searchTerm in searchResult)
		for (const { title, url } of searchResult[searchTerm])
			if (searchTerm && title && url) output.push({ searchTerm, title, url })
`}</WrappedHighlight>
			</div>
			<div className={xyzFrom(6)} xyz='fade'>
				<WrappedHighlight>{`	res.status(200).json(shuffle(output))
`}</WrappedHighlight>
			</div>
			<div className={xyzFrom(3)} xyz='fade'>
				<WrappedHighlight>{'}'}</WrappedHighlight>
			</div>
		</div>
	)
}

type Args = [goal: number] | [start: number, end: number]

export default withRouter(function main() {
	const slide = useContext(slideContext)

	const [ideasAboutDyslexia, setIdeasAboutDyslexia] = useState<string[]>([
		'Dyslexia makes it hard to read',
	])

	const isValidSlide = (...args: Args) =>
		args[1] !== undefined
			? args[0] <= slide && slide < args[1]
			: slide === args[0]

	const xyzSlideClass = (...args: Args) =>
		isValidSlide(...args) ? 'xyz-in' : 'xyz-out'

	const slideXyzBasis = 'fade in-delay-3'

	const s0i = 0
	const s1i = s0i + 4
	const s2i = s1i + 2
	const s3i = s2i + 2
	const s4i = s3i + 2
	const s5i = s4i + 1
	const s6i = s5i + 1
	const s7i = s6i + 3
	const s8i = s7i + 5
	const s9i = s8i + 1
	const s10i = s9i + 1
	const s11i = s10i + 1
	const s12i = s11i + 1

	return (
		<div className='main'>
			<Head>
				<title>Term Project</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div
				className={`slide title-slide nuclear ${xyzSlideClass(s0i, s1i)}`}
				xyz={slideXyzBasis}>
				<h1 className='watermark'>
					How can people succeed in life despite having a health condition or
					disability.
				</h1>
				<h1>
					Task (
					<i
						className={
							isValidSlide(-10, s0i + 1)
								? 'underline-me'
								: 'underline-me active'
						}>
						Personal Problem
					</i>
					):{' '}
					<i>
						How can people succeed in life despite having a health condition or
						disability.
					</i>
				</h1>
				<p>
					<span className={xyzSlideClass(s0i + 2, s1i)}>
						Can't we all agree that being dead is a problem?
					</span>{' '}
					<span className={xyzSlideClass(s0i + 3)}>
						Maybe even a <i>personal</i> problem
					</span>
				</p>
			</div>
			<div
				className={`slide nuclear ${xyzSlideClass(s1i, s2i)}`}
				xyz={slideXyzBasis}>
				<div className='title-slide'>
					<h1
						className={
							isValidSlide(s1i - 1, s1i + 1)
								? 'strike-me insane invisible'
								: 'strike-me active insane'
						}>
						Insane.
					</h1>
					<h1
						className={
							isValidSlide(s1i - 1, s1i + 1) ? 'strike-me' : 'strike-me active'
						}>
						Nuclear.
					</h1>
					<p>Oh no here we go again</p>
				</div>
				<div>
					<ImageCitation
						source='https://image.freepik.com/free-vector/hand-holding-floating-atom_196702-1.jpg'
						name='hand-holding-floating-atom from freepik.com (Sorry this graphic was just too cool not to include)'
					/>
				</div>
			</div>
			<div
				className={`slide title-slide ${xyzSlideClass(s2i, s3i)}`}
				xyz={slideXyzBasis}>
				<h1 className='watermark'>
					Dyslexia is not illiteracy, its a superpower
				</h1>
				<h1>
					<span
						className={
							isValidSlide(s2i + 1, Infinity) ? 'strike-me active' : 'strike-me'
						}>
						Iuihvauo.
					</span>
				</h1>
				<p></p>
			</div>
			<div
				className={`slide title-slide dyslexia ${xyzSlideClass(s3i, s4i)}`}
				xyz={slideXyzBasis}>
				<h1 className='watermark'>The Dyslectic Difference</h1>
				<h1>Dyzlectiq</h1>
				<p className={xyzSlideClass(s3i + 1)} xyz='fade right-3'>
					The Dyslectic Difference
				</p>
			</div>
			<div
				className={`slide dyslexia-prompt ${xyzSlideClass(s4i)}`}
				xyz={slideXyzBasis}>
				<IdeaEnterArea
					ideasAboutDyslexia={ideasAboutDyslexia}
					setIdeasAboutDyslexia={setIdeasAboutDyslexia}
					isShown={isValidSlide(s4i)}
				/>
			</div>
			<div
				className={`slide dyslexia-images ${xyzSlideClass(s5i)}`}
				xyz={slideXyzBasis}>
				{isValidSlide(s5i) ? (
					<IdeaVisualizerPage ideasAboutDyslexia={ideasAboutDyslexia} />
				) : (
					''
				)}
			</div>
			<div
				className={`slide code ${xyzSlideClass(s6i, s7i)}`}
				xyz={slideXyzBasis}>
				<h1>
					<span
						className={`strike-me ${
							isValidSlide(s6i + 2, Infinity) ? 'active' : ''
						}`}>
						But how did I do that?
					</span>{' '}
					<span className={xyzSlideClass(s6i + 2)} xyz='fade'>
						Now, back to topic
					</span>
				</h1>
				<CodeRenderer onSlide={s6i + 1} />
			</div>
			<div
				className={`slide title-slide entry-brain ${xyzSlideClass(s7i, s8i)}`}
				xyz={slideXyzBasis}>
				<h1>
					Contrary to popular belief dyslexia is{' '}
					<i
						className={
							isValidSlide(s7i + 1, Infinity)
								? 'underline-me active'
								: 'underline-me'
						}>
						not
					</i>{' '}
					an error in the lexical region of the brain, but rather a complete{' '}
					<i
						className={
							isValidSlide(s7i + 2, Infinity)
								? 'underline-me active'
								: 'underline-me'
						}>
						rewire.
					</i>
				</h1>
				<p className={xyzSlideClass(s7i + 3, Infinity)} xyz='fade'>
					Lets show this with a bit of a{' '}
					<span
						className={
							isValidSlide(s7i + 4, Infinity) ? 'strike-me active' : 'strike-me'
						}>
						whimsical
					</span>{' '}
					<i
						className={
							isValidSlide(s7i + 4, Infinity) ? 'sus' : 'sus inactive'
						}>
						sus
					</i>{' '}
					example
					<span className={xyzSlideClass(s7i + 4)}>
						<img src='/moogus-svg.svg' />
					</span>
				</p>
			</div>
			<div
				className={`slide brain ${xyzSlideClass(s8i, s9i)}`}
				xyz={slideXyzBasis}>
				<div>
					<div className='title'>
						<div>
							<h1>
								The brain of an average moogus
								<div />
							</h1>
						</div>
					</div>
					<div className='content'>
						<img src='/clean.png' width='100%' />
						<ul>
							<li>Clean</li>
							<li>Simple</li>
							<li>Not a microsoft product</li>
							<li>Works well</li>
						</ul>
					</div>
				</div>
			</div>
			<div className='sus'>
				<Image src='/moogus-svg.svg' width='50px' height='auto' />
			</div>
		</div>
	)
})
