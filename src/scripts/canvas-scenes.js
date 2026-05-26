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

const drawCircle = (context, x, y, radius, color, alpha) => {
	context.globalAlpha = alpha;
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fill();
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
		gradient.addColorStop(0, 'rgba(214, 229, 255, 0.18)');
		gradient.addColorStop(0.45, 'rgba(168, 196, 242, 0.08)');
		gradient.addColorStop(1, 'rgba(168, 196, 242, 0)');

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

const createStars = (count) =>
	Array.from({ length: count }, () => ({
		x: Math.random() - 0.5,
		y: Math.random() - 0.5,
		depth: 0.35 + Math.random() * 0.95,
		phase: Math.random() * Math.PI * 2,
		size: 0.55 + Math.random() * 0.95,
		alpha: 0.42 + Math.random() * 0.44,
	}));

const drawGlow = (context, x, y, radius, innerColor, middleColor, alpha) => {
	const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
	gradient.addColorStop(0, innerColor);
	gradient.addColorStop(0.4, middleColor);
	gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
	context.globalAlpha = alpha;
	context.fillStyle = gradient;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fill();
};

const startBackdropScene = ({ backdrop, cleanups }) => {
	const layer = createCanvasLayer(backdrop, { pixelRatioLimit: 1.8, useWindowSize: true });
	const { context } = layer;
	const stars = createStars(950);
	const pointer = { x: 0, y: 0 };
	let rafId = 0;

	const onPointerMove = (event) => {
		pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
		pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
	};

	const onResize = () => {
		layer.resize();
	};

	const animateBackdrop = (time) => {
		const elapsed = time / 1000;
		const { width, height } = layer.size;
		const centerX = width / 2;
		const centerY = height / 2;
		const rotation = elapsed * 0.01;
		const sin = Math.sin(rotation);
		const cos = Math.cos(rotation);

		context.clearRect(0, 0, width, height);
		drawGlow(
			context,
			centerX - width * 0.16 + pointer.x * 10,
			centerY + height * 0.08 - pointer.y * 7,
			Math.min(width, height) * 0.42,
			'rgba(173, 203, 255, 0.34)',
			'rgba(180, 208, 255, 0.12)',
			0.22,
		);
		drawGlow(
			context,
			centerX + width * 0.24 - pointer.x * 8,
			centerY - height * 0.18 + pointer.y * 6,
			Math.min(width, height) * 0.32,
			'rgba(255, 220, 170, 0.22)',
			'rgba(180, 208, 255, 0.08)',
			0.16,
		);

		stars.forEach((star) => {
			const worldX = star.x * width * 1.12;
			const worldY = star.y * height * 1.12;
			const rotatedX = worldX * cos - worldY * sin;
			const rotatedY = worldX * sin + worldY * cos;
			const x = centerX + rotatedX + pointer.x * star.depth * 12;
			const y = centerY + rotatedY - pointer.y * star.depth * 8;
			const alpha = star.alpha + Math.sin(elapsed * 0.9 + star.phase) * 0.08;
			drawCircle(context, x, y, star.size, '#cfe2ff', Math.max(0.12, alpha));
		});

		context.globalAlpha = 1;
		rafId = window.requestAnimationFrame(animateBackdrop);
	};

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('resize', onResize);
	rafId = window.requestAnimationFrame(animateBackdrop);

	cleanups.push(() => {
		window.cancelAnimationFrame(rafId);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('resize', onResize);
		layer.remove();
	});
};

export const startCanvasScenes = ({
	backdrop,
	scannerGraphic,
	scannerCanvasHost,
	prefersReducedMotion,
	cleanups = [],
}) => {
	if (scannerGraphic && scannerCanvasHost) {
		startScannerScene({ scannerCanvasHost, cleanups });
	}

	if (backdrop && !prefersReducedMotion) {
		startBackdropScene({ backdrop, cleanups });
	}
};
