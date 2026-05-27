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
		gradient.addColorStop(0, 'rgba(204, 56, 39, 0.16)');
		gradient.addColorStop(0.45, 'rgba(36, 119, 132, 0.08)');
		gradient.addColorStop(1, 'rgba(36, 119, 132, 0)');

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

const createMarks = (count) =>
	Array.from({ length: count }, () => ({
		x: Math.random() - 0.5,
		y: Math.random() - 0.5,
		depth: 0.35 + Math.random() * 0.95,
		phase: Math.random() * Math.PI * 2,
		size: 0.45 + Math.random() * 1.2,
		alpha: 0.06 + Math.random() * 0.14,
		color: Math.random() > 0.76 ? '#cc3827' : Math.random() > 0.58 ? '#247784' : '#2b2a22',
		line: Math.random() > 0.88,
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
	const marks = createMarks(220);
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
			'rgba(36, 119, 132, 0.16)',
			'rgba(36, 119, 132, 0.06)',
			0.16,
		);
		drawGlow(
			context,
			centerX + width * 0.24 - pointer.x * 8,
			centerY - height * 0.18 + pointer.y * 6,
			Math.min(width, height) * 0.32,
			'rgba(204, 56, 39, 0.13)',
			'rgba(195, 165, 60, 0.06)',
			0.13,
		);

		marks.forEach((mark) => {
			const worldX = mark.x * width * 1.12;
			const worldY = mark.y * height * 1.12;
			const rotatedX = worldX * cos - worldY * sin;
			const rotatedY = worldX * sin + worldY * cos;
			const x = centerX + rotatedX + pointer.x * mark.depth * 12;
			const y = centerY + rotatedY - pointer.y * mark.depth * 8;
			const alpha = mark.alpha + Math.sin(elapsed * 0.9 + mark.phase) * 0.05;

			if (mark.line) {
				context.globalAlpha = Math.max(0.035, alpha);
				context.strokeStyle = mark.color;
				context.lineWidth = 1;
				context.beginPath();
				context.moveTo(x - mark.size * 5, y);
				context.lineTo(x + mark.size * 5, y);
				context.stroke();
				context.beginPath();
				context.moveTo(x, y - mark.size * 5);
				context.lineTo(x, y + mark.size * 5);
				context.stroke();
				return;
			}

			drawCircle(context, x, y, mark.size, mark.color, Math.max(0.035, alpha));
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
