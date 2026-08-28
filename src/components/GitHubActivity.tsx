import { useEffect, useState } from 'react';
import { ActivityCalendar, type Activity } from 'react-activity-calendar';

type ColorScheme = 'light' | 'dark';

const getColorScheme = (): ColorScheme =>
	typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

type GitHubActivityProps = {
	contributions: Activity[];
};

export default function GitHubActivity({ contributions }: GitHubActivityProps) {
	const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

	useEffect(() => {
		const observer = new MutationObserver(() => setColorScheme(getColorScheme()));

		setColorScheme(getColorScheme());
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		return () => observer.disconnect();
	}, []);

	return (
		<ActivityCalendar
			data={contributions}
			colorScheme={colorScheme}
			blockMargin={4}
			blockRadius={1}
			blockSize={12}
			fontSize={12}
			showWeekdayLabels={['mon', 'wed', 'fri']}
			theme={{
				light: ['#d5cfbd', '#a43b17'],
				dark: ['#292a20', '#db6334'],
			}}
			labels={{
				totalCount: '{{count}} contributions in the last year',
			}}
			maxLevel={4}
		/>
	);
}
