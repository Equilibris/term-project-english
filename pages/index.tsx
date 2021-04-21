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
					<li key={index} className='xyz-in' xyz='fade right-3'>
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

const Dyslectic: FC<{
	className?: string
	name: string
	image: string
	synopsis: string
}> = ({ className, image, name, synopsis }) => (
	<div className={`dyslectic ${className || ''}`}>
		<img src={image} />
		<h2>{name}</h2>
		<sub>{synopsis}</sub>
	</div>
)

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
	const s9i = s8i + 2
	const s10i = s9i + 4
	const s11i = s10i + 2
	const s12i = s11i + 5
	const s13i = s12i + 3
	const s14i = s13i + 3

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
						<div xyz={'fade'}>
							<h1 className={xyzSlideClass(-Infinity, s8i + 1)}>
								The brain of an average moogus
								<div />
							</h1>
							<h1 className={xyzSlideClass(s8i + 1, Infinity)}>
								The brain of a <i className='underline-me'>dyslectic</i> moogus
								<div />
							</h1>
						</div>
					</div>
					<div className='content'>
						<div className='image' xyz='fade'>
							<img
								className={xyzSlideClass(-Infinity, s8i + 1)}
								src='/clean.png'
								width='100%'
							/>
							<img
								className={xyzSlideClass(s8i + 1, Infinity)}
								src='/mess.png'
								width='100%'
							/>
						</div>
						<ul>
							<li>
								<span
									className={
										isValidSlide(-Infinity, s8i + 1)
											? 'strike-me'
											: 'strike-me active'
									}>
									Clean
								</span>
							</li>
							<li>
								<span
									className={
										isValidSlide(-Infinity, s8i + 1)
											? 'strike-me'
											: 'strike-me active'
									}>
									Simple
								</span>
							</li>
							<ul
								className={
									isValidSlide(s8i + 1, Infinity) ? 'nested' : 'nested inactive'
								}
								xyz='fade stagger right-3'>
								<li className={xyzSlideClass(s8i + 1, Infinity)}>
									A complete mess
								</li>
								<li className={xyzSlideClass(s8i + 1, Infinity)}>
									In no way simple
								</li>
								<li className={xyzSlideClass(s8i + 1, Infinity)}>
									Still does something but not that you expect
								</li>
							</ul>
							<li>Works well</li>
						</ul>
					</div>
				</div>
				<div className='sus'>
					<Image src='/moogus-svg.svg' layout='fill' />
				</div>
			</div>
			<div
				className={`slide code ${xyzSlideClass(s9i, s10i)}`}
				xyz={slideXyzBasis}>
				<h1>
					Remember this?{' '}
					<span className={xyzSlideClass(s9i + 2, Infinity)}>
						This is{' '}
						<i
							className={
								isValidSlide(s9i + 3, Infinity)
									? 'underline-me active'
									: 'underline-me'
							}>
							javascript
						</i>
					</span>
				</h1>
				<CodeRenderer onSlide={s9i + 1} />
			</div>
			<div
				className={`slide title-slide ${xyzSlideClass(s10i, s11i)}`}
				xyz={slideXyzBasis}>
				<h1 className='watermark'>
					novel problem solving, The powers of dyslexia
				</h1>
				<h1>But what makes programming different?</h1>
				<p className={xyzSlideClass(s10i + 1, s11i)}>Novel problem solving.</p>
			</div>
			<div
				className={`slide brain-regions ${xyzSlideClass(s11i, s12i)}`}
				xyz={slideXyzBasis}>
				<h1>
					Novel problem solving is{' '}
					<i
						className={
							isValidSlide(s11i + 1, Infinity)
								? 'underline-me active'
								: 'underline-me'
						}>
						hard.
					</i>{' '}
					<span className={xyzSlideClass(s11i + 2, Infinity)}>
						Even harder than maths and language.
					</span>
				</h1>
				<div className={`content ${xyzSlideClass(s11i + 3, Infinity)}`}>
					<ImageCitation
						source='https://cdn.discordapp.com/attachments/578587162954432522/831449591740104734/unknown.png'
						name='Language &amp; the multiple-demand system'
					/>
					<div className={xyzSlideClass(s11i + 4)}>
						<ImageCitation
							source='https://iiif.elifesciences.org/lax/59340%2Felife-59340-fig1-v1.tif/full/1500,/0/default.jpg'
							name='programming brain regions'
						/>
					</div>
				</div>
			</div>
			<div
				className={`slide compare ${xyzSlideClass(s12i, s13i)}`}
				xyz={slideXyzBasis}>
				<h1>But it doesn't stop there.</h1>
				<div className='content'>
					<div className={xyzSlideClass(s12i + 1, Infinity)}>
						<h2>Dyslexias strengths:</h2>
						<ul>
							<li
								className={xyzSlideClass(s12i + 1, Infinity)}
								xyz='fade stagger right-3'>
								Novel problem solving
							</li>
							<li
								className={xyzSlideClass(s12i + 1, Infinity)}
								xyz='fade stagger right-3'>
								Pattern recognition
							</li>
							<li
								className={xyzSlideClass(s12i + 1, Infinity)}
								xyz='fade stagger right-3'>
								Spacial reasoning
							</li>
							<li
								className={xyzSlideClass(s12i + 1, Infinity)}
								xyz='fade stagger right-3'>
								Abstract &amp; critical thinking
							</li>
							<li
								className={xyzSlideClass(s12i + 1, Infinity)}
								xyz='fade stagger right-3'>
								Boosted creativity
							</li>
							<li
								className={xyzSlideClass(s12i + 1, Infinity)}
								xyz='fade stagger right-3'>
								A mind for business
							</li>
						</ul>
					</div>
					<div className={xyzSlideClass(s12i + 2, Infinity)}>
						<h2>Dyslexias perils:</h2>
						<ul>
							<li>Reading</li>
							<li>Writing</li>
						</ul>
					</div>
				</div>
			</div>
			<div
				className={`slide case-study ${xyzSlideClass(s13i, s14i)}`}
				xyz={slideXyzBasis}>
				<h1>
					Case study:{' '}
					<span
						className={`${xyzSlideClass(s13i + 1, Infinity)} strike-me ${
							isValidSlide(s13i + 2, Infinity) ? 'active' : ''
						}`}>
						This wasn't PowerPoint
					</span>{' '}
					<span className={xyzSlideClass(s13i + 2, Infinity)}>
						There are so many awesome dyslectics
					</span>
				</h1>
				<div className='content'>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image='https://www.biography.com/.image/t_share/MTE4MDAzNDEwNDYyNDEwMjU0/sir-richard-branson-9224520-1-402.jpg'
						name='Richard Branson'
						synopsis='English businessman, net worth US$5.6 billion'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image='https://www.fineart.no/i/brand_img/40-0.jpg/doc-carousel'
						name='Pablo Picasso'
						synopsis='Internationally acclaimed artist'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image='data:image/jpeg;base64,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'
						name='Erna Solberg'
						synopsis='Norwegian politician and current prime minister'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 3)}
						image=''
						name=''
						synopsis=''
					/>
				</div>
			</div>
		</div>
	)
})
