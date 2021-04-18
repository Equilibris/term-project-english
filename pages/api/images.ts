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
	await Promise.all(
		ensureArray(req.query['term']).map(
			async (x) => (searchResult[x] = (await google.scrape(x, 100)) as any)
		)
	)
	const output: Data = []

	for (const searchTerm in searchResult)
		for (const { title, url } of searchResult[searchTerm])
			if (searchTerm && title && url) output.push({ searchTerm, title, url })

	res.status(200).json(shuffle(output))
}
