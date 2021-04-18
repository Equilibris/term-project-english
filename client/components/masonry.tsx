import React, {
	Children,
	FC,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react'
import { RequireExactlyOne } from 'type-fest'

import styles from 'styles/components/Masonry.module.scss'
import { useWindowSize } from 'react-use'

export const Masonry: FC<
	{
		gap?: number
		className?: string
		style?: React.CSSProperties
	} & RequireExactlyOne<{
		elementMaxWidth: number
		elementMinWidth: number

		elementCount: number
	}>
> = ({
	children,
	gap: maybeGap,
	className,
	style,
	...distributionFunction
}) => {
	const gap = maybeGap ?? 0
	const mainRef = useRef<HTMLDivElement>(null)

	const [elementDistribution, setElementDistribution] = useState<ReactNode[][]>(
		[[]],
	)
	const { width } = useWindowSize(1900, 1080)

	useEffect(() => {
		const arrayChildren = Children.toArray(children)

		const setElementDistributionFromCount = (count: number) => {
			if (arrayChildren.length <= count)
				return setElementDistribution(arrayChildren.map((x) => [x]))

			const elementDistribution: ReactNode[][] = [
				...Array(count).keys(),
			].map(() => [])

			arrayChildren.forEach((element, index) =>
				elementDistribution[index % count].push(element),
			)

			setElementDistribution(elementDistribution)
		}

		if (distributionFunction.elementCount) {
			setElementDistributionFromCount(distributionFunction.elementCount)
			return () => {}
		}

		const resizeListener = function (): void {
			// TODO: make this function work
			if (distributionFunction.elementMaxWidth && mainRef.current)
				setElementDistributionFromCount(
					Math.floor(
						mainRef.current.clientWidth /
							(distributionFunction.elementMaxWidth + gap),
					),
				)
			else if (distributionFunction.elementMinWidth && mainRef.current)
				setElementDistributionFromCount(
					Math.ceil(
						mainRef.current.clientWidth / distributionFunction.elementMinWidth,
					) - 1,
				)
		}
		resizeListener()
	}, [children, width])

	return (
		<div
			ref={mainRef}
			className={`${styles.container} ${className ?? ''}`}
			style={{ ...style, gap }}>
			{elementDistribution.map((row, index) => (
				<div key={index} style={{ gap }}>
					{row.map((element, index) => (
						<div key={index}>{element}</div>
					))}
				</div>
			))}
		</div>
	)
}
