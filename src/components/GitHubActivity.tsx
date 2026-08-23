import { useEffect, useState } from 'react';
import { GitHubCalendar } from 'react-github-calendar';

type ColorScheme = 'light' | 'dark';

const getColorScheme = (): ColorScheme =>
	typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export default function GitHubActivity() {
	const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const observer = new MutationObserver(() => setColorScheme(getColorScheme()));

		setColorScheme(getColorScheme());
		setIsMounted(true);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		return () => observer.disconnect();
	}, []);

	if (!isMounted) {
		return <span className="github-calendar-loading">Loading contribution data…</span>;
	}

	return (
		<GitHubCalendar
			username="padsbanger"
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
		/>
	);
}
