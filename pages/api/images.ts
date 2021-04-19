import Scraper from 'images-scraper'
import { shuffle } from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'

// Safe means no to horny
const google = new Scraper({ safe: true, puppeteer: { headless: true } })

export type Data = Record<'searchTerm' | 'url' | 'title', string>[]

const ensureArray = <T>(input: T | T[]) =>
	Array.isArray(input) ? input : [input]

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	const searchResult: Record<string, Record<'title' | 'url', string>[]> = {}

	const terms = ensureArray(req.query['term'])

	for (const index in terms) {
		const term = terms[index]
		console.log('fetching term:', term)
		searchResult[term] = (await google.scrape(term, 50)) as any
		console.log('done', 1 + +index, '/', terms.length)
	}
	const output: Data = []

	for (const searchTerm in searchResult)
		for (const { title, url } of searchResult[searchTerm])
			if (searchTerm && title && url) output.push({ searchTerm, title, url })

	res.status(200).json(shuffle(output))
}
