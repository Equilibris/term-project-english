import React, { FC } from 'react'

const SitedImage: FC<{ source: string; name?: string }> = ({
	source,
	name,
}) => {
	return (
		<div className='image-citation'>
			<div>
				<img src={source} />
			</div>
			<p>
				<a href={source}>{name || source}</a>
			</p>
		</div>
	)
}

export default SitedImage
