const createCanvasLayer = (host, { pixelRatioLimit = 1.5, useWindowSize = false } = {}) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d', { alpha: true });
	host.append(canvas);

	let width = 1;
	let height = 1;
	let pixelRatio = 1;

	const resize = () => {
		const rect = useWindowSize ? null : host.getBoundingClientRect();
		width = useWindowSize ? window.innerWidth : rect.width || 1;
		height = useWindowSize ? window.innerHeight : rect.height || 1;
		pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatioLimit);

		canvas.width = Math.ceil(width * pixelRatio);
		canvas.height = Math.ceil(height * pixelRatio);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		return { width, height, pixelRatio };
	};

	resize();

	return {
		canvas,
		context,
		get size() {
			return { width, height, pixelRatio };
		},
		resize,
		remove: () => canvas.remove(),
	};
};

const startScannerScene = ({ scannerCanvasHost, cleanups }) => {
	const layer = createCanvasLayer(scannerCanvasHost, { pixelRatioLimit: 1.5 });
	const { context } = layer;
	let rafId = 0;

	const resizeScanner = () => {
		layer.resize();
	};

	resizeScanner();

	const drawShimmer = (elapsed) => {
		const { width, height } = layer.size;
		const radius = Math.min(width, height) * (0.23 + Math.sin(elapsed * 0.34) * 0.004);
		const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);
		gradient.addColorStop(0, 'rgba(36, 111, 138, 0.16)');
		gradient.addColorStop(0.45, 'rgba(36, 111, 138, 0.06)');
		gradient.addColorStop(1, 'rgba(36, 111, 138, 0)');

		context.globalAlpha = 0.14 + Math.sin(elapsed * 0.55) * 0.03;
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
		context.fill();
	};

	const animateScanner = (time) => {
		const elapsed = time / 1000;
		const { width, height } = layer.size;
		context.clearRect(0, 0, width, height);
		drawShimmer(elapsed);
		context.globalAlpha = 1;

		rafId = window.requestAnimationFrame(animateScanner);
	};

	rafId = window.requestAnimationFrame(animateScanner);
	window.addEventListener('resize', resizeScanner);
	cleanups.push(() => {
		window.cancelAnimationFrame(rafId);
		window.removeEventListener('resize', resizeScanner);
		layer.remove();
	});
};

export const startCanvasScenes = ({
	scannerGraphic,
	scannerCanvasHost,
	cleanups = [],
}) => {
	if (scannerGraphic && scannerCanvasHost) {
		startScannerScene({ scannerCanvasHost, cleanups });
	}
};
