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

	useInterval(inc, 1000/3)

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
	<div className={className}>
		<div className={`dyslectic`}>
			<div
				className='image'
				style={{ background: `url(${image})`, backgroundSize: 'cover' }}
			/>
			<h2>
				<div>{name}</div>
			</h2>
			<sub>{synopsis}</sub>
		</div>
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
	const s15i = s14i + 4
	const s16i = s15i + 2

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
					{/* <span
						className={`${xyzSlideClass(s13i + 1, Infinity)} strike-me ${
							isValidSlide(s13i + 2, Infinity) ? 'active' : ''
						}`}>
						This wasn't PowerPoint
					</span>{' '} */}
					<span className={xyzSlideClass(s13i + 1, Infinity)}>
						A few dyslectic <i>geniuses.</i>
					</span>
				</h1>
				<div className='content' xyz='fade down-3 stagger-1'>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://www.biography.com/.image/t_share/MTE4MDAzNDEwNDYyNDEwMjU0/sir-richard-branson-9224520-1-402.jpg'
						name='Richard Branson'
						synopsis='English businessman, net worth US$5.6 billion'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://www.fineart.no/i/brand_img/40-0.jpg/doc-carousel'
						name='Pablo Picasso'
						synopsis='Internationally acclaimed artist'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='data:image/jpeg;base64,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'
						name='Erna Solberg'
						synopsis='Norwegian politician and current prime minister'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://img.jakpost.net/c/2019/05/20/2019_05_20_72607_1558317268._large.jpg'
						name='Keanu Reeves'
						synopsis='Breathtaking actor'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg'
						name='Albert Einstein'
						synopsis='Truly ridiculus genius and physics pioneer'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='http://www.leonardodavinci.net/images/leonardo-da-vinci.jpg'
						name='Leonardo Da Vinci'
						synopsis='Multi field genius'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://www.varsity.co.uk/images/dyn/store/1500/0/35036.jpeg'
						name='Thomas Brodie-Sangster'
						synopsis='Queens gambit lying asexual'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://upload.wikimedia.org/wikipedia/commons/d/db/Pierre_Curie_by_Dujardin_c1906.jpg'
						name='Pierre Curie'
						synopsis='Husband to Marie Curie and co-discoverer of radioactivity'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='data:image/jpeg;base64,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'
						name='Octavia Spencer'
						synopsis='Incredible actor and producer'
					/>
					<Dyslectic
						className={xyzSlideClass(s13i + 2, Infinity)}
						image='https://www.biography.com/.image/t_share/MTQ3NjYxMzk4NjkwNzY4NDkz/muhammad_ali_photo_by_stanley_weston_archive_photos_getty_482857506.jpg'
						name='Mohammad Ali'
						synopsis='World renowned boxer'
					/>
				</div>
			</div>
			<div
				className={`slide title-slide ${xyzSlideClass(s14i, s15i)}`}
				xyz={slideXyzBasis}>
				<h1 className='watermark'>I finessed the bloody task again!</h1>
				<h1>
					To sum up:{' '}
					<span className={xyzSlideClass(s14i + 1, Infinity)}>
						Dyslexia is{' '}
						<i
							className={
								isValidSlide(s14i + 2, Infinity)
									? 'underline-me active'
									: 'underline-me'
							}>
							not{' '}
						</i>
						a disadvantage but rather a{' '}
						<i
							className={
								isValidSlide(s14i + 3, Infinity)
									? 'underline-me active'
									: 'underline-me'
							}>
							quirk.
						</i>
					</span>
				</h1>
				<p></p>
			</div>
			<div
				className={`slide sources ${xyzSlideClass(s15i, s16i)}`}
				xyz={slideXyzBasis}>
				<h1>Sources</h1>
				<ul xyz='fade right-3 stagger'>
					<li className={xyzSlideClass(s15i + 1, Infinity)}>
						<a href='http://dyslexiahelp.umich.edu/dyslexics/learn-about-dyslexia/what-is-dyslexia/the-many-strengths-of-dyslexics'>
							http://dyslexiahelp.umich.edu/dyslexics/learn-about-dyslexia/what-is-dyslexia/the-many-strengths-of-dyslexics
						</a>
					</li>
					<li className={xyzSlideClass(s15i + 1, Infinity)}>
						<a href='https://www.nessy.com/us/parents/dyslexia-information/9-strengths-dyslexia/'>
							https://www.nessy.com/us/parents/dyslexia-information/9-strengths-dyslexia/
						</a>
					</li>
					<li className={xyzSlideClass(s15i + 1, Infinity)}>
						<a href='https://elifesciences.org/articles/59340#fig1'>
							https://elifesciences.org/articles/59340#fig1
						</a>
					</li>
					<li className={xyzSlideClass(s15i + 1, Infinity)}>
						<a href='https://www.dyslexia.com/about-dyslexia/dyslexic-achievers/all-achievers/'>
							https://www.dyslexia.com/about-dyslexia/dyslexic-achievers/all-achievers/
						</a>
					</li>
					<li className={xyzSlideClass(s15i + 1, Infinity)}>
						<a href='https://www.dyslexia.com/about-dyslexia/dyslexic-talents/dyslexia-8-basic-abilities/'>
							https://www.dyslexia.com/about-dyslexia/dyslexic-talents/dyslexia-8-basic-abilities/
						</a>
					</li>
					<li className={xyzSlideClass(s15i + 1, Infinity)}>
						<a href='https://en.wikipedia.org/wiki/Dyslexia'>
							https://en.wikipedia.org/wiki/Dyslexia
						</a>
					</li>
				</ul>
			</div>
			<div className={`slide end ${xyzSlideClass(s16i)}`} xyz={slideXyzBasis}>
				<div />
				<h1>
					Thanks for your <br /> attention
				</h1>
			</div>
		</div>
	)
})
