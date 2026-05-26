import {
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Clock,
	Group,
	MathUtils,
	OrthographicCamera,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	Sprite,
	SpriteMaterial,
	Vector3,
	WebGLRenderer,
} from 'three';

const clearGroup = (group) => {
	group.children.forEach((child) => {
		child.geometry?.dispose?.();
		if (child.material?.map) {
			child.material.map.dispose?.();
		}
		child.material?.dispose?.();
	});
	group.clear();
};

const startScannerScene = ({ scannerGraphic, scannerThreeHost, cleanups }) => {
	const scene = new Scene();
	const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	camera.position.z = 1;

	const renderer = new WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
	renderer.setClearColor(0x000000, 0);
	scannerThreeHost.append(renderer.domElement);

	const dustGroup = new Group();
	const shimmerGroup = new Group();
	scene.add(dustGroup, shimmerGroup);

	const buildDust = (width, height) => {
		clearGroup(dustGroup);
		const dustBands = [
			{ innerRadius: 0.2, outerRadius: 0.34, count: 180, opacity: 0.14, color: 0xd7e6ff },
			{ innerRadius: 0.4, outerRadius: 0.58, count: 240, opacity: 0.1, color: 0xbfd4f5 },
		];

		dustBands.forEach((band, bandIndex) => {
			const points = [];
			for (let index = 0; index < band.count; index += 1) {
				const angle = Math.random() * Math.PI * 2;
				const radius = MathUtils.lerp(band.innerRadius, band.outerRadius, Math.random());
				const spreadX = width * radius * (0.85 + Math.random() * 0.15);
				const spreadY = height * radius * (0.85 + Math.random() * 0.15);
				points.push(
					new Vector3(
						Math.cos(angle) * spreadX * 0.5 + (Math.random() - 0.5) * 6,
						Math.sin(angle) * spreadY * 0.5 + (Math.random() - 0.5) * 6,
						0,
					),
				);
			}

			const geometry = new BufferGeometry().setFromPoints(points);
			const material = new PointsMaterial({
				color: band.color,
				size: bandIndex === 0 ? 1.1 : 0.9,
				sizeAttenuation: false,
				transparent: true,
				opacity: band.opacity,
				depthWrite: false,
			});
			const dust = new Points(geometry, material);
			dustGroup.add(dust);
		});
	};

	const buildShimmer = (width, height) => {
		clearGroup(shimmerGroup);
		const shimmerTextureSize = 256;
		const shimmerCanvas = document.createElement('canvas');
		shimmerCanvas.width = shimmerTextureSize;
		shimmerCanvas.height = shimmerTextureSize;
		const shimmerContext = shimmerCanvas.getContext('2d');
		if (!shimmerContext) return;

		const gradient = shimmerContext.createRadialGradient(
			shimmerTextureSize / 2,
			shimmerTextureSize / 2,
			0,
			shimmerTextureSize / 2,
			shimmerTextureSize / 2,
			shimmerTextureSize / 2,
		);
		gradient.addColorStop(0, 'rgba(214, 229, 255, 0.18)');
		gradient.addColorStop(0.45, 'rgba(168, 196, 242, 0.08)');
		gradient.addColorStop(1, 'rgba(168, 196, 242, 0)');
		shimmerContext.fillStyle = gradient;
		shimmerContext.fillRect(0, 0, shimmerTextureSize, shimmerTextureSize);

		const texture = new CanvasTexture(shimmerCanvas);
		const sprite = new Sprite(
			new SpriteMaterial({
				map: texture,
				transparent: true,
				opacity: 0.18,
				depthWrite: false,
			}),
		);
		sprite.scale.set(width * 0.48, height * 0.48, 1);
		sprite.position.set(0, 0, 0);
		shimmerGroup.add(sprite);
	};

	const rebuildScannerAtmosphere = () => {
		const rect = scannerGraphic.getBoundingClientRect();
		const width = rect.width || 1;
		const height = rect.height || 1;

		camera.left = -width / 2;
		camera.right = width / 2;
		camera.top = height / 2;
		camera.bottom = -height / 2;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

		buildDust(width, height);
		buildShimmer(width, height);
		renderer.render(scene, camera);
	};

	rebuildScannerAtmosphere();

	let scannerFrame = 0;
	const scannerClock = new Clock();
	const animateScanner = () => {
		const elapsed = scannerClock.getElapsedTime();
		dustGroup.rotation.z = elapsed * 0.007;
		dustGroup.children.forEach((dust, index) => {
			if (dust.material) {
				dust.material.opacity =
					(index === 0 ? 0.13 : 0.09) + Math.sin(elapsed * (0.42 + index * 0.1)) * 0.018;
			}
		});

		const shimmer = shimmerGroup.children[0];
		if (shimmer?.material) {
			shimmer.material.opacity = 0.14 + Math.sin(elapsed * 0.55) * 0.03;
			const shimmerScale = 0.23 + Math.sin(elapsed * 0.34) * 0.004;
			shimmer.scale.set(
				(camera.right - camera.left) * shimmerScale,
				(camera.top - camera.bottom) * shimmerScale,
				1,
			);
		}

		renderer.render(scene, camera);
		scannerFrame = window.requestAnimationFrame(animateScanner);
	};

	animateScanner();

	const resizeScanner = () => rebuildScannerAtmosphere();
	window.addEventListener('resize', resizeScanner);
	cleanups.push(() => {
		window.cancelAnimationFrame(scannerFrame);
		window.removeEventListener('resize', resizeScanner);
		[dustGroup, shimmerGroup].forEach(clearGroup);
		renderer.dispose();
	});
};

const createBackdropGlowTexture = (innerColor, outerColor) => {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext('2d');
	if (!context) return null;

	const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	gradient.addColorStop(0, innerColor);
	gradient.addColorStop(0.4, 'rgba(180, 208, 255, 0.12)');
	gradient.addColorStop(1, outerColor);
	context.fillStyle = gradient;
	context.fillRect(0, 0, size, size);
	return new CanvasTexture(canvas);
};

const startBackdropScene = ({ backdrop, cleanups }) => {
	const scene = new Scene();
	const camera = new PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.z = 18;

	const renderer = new WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000, 0);
	backdrop.append(renderer.domElement);

	const root = new Group();
	scene.add(root);

	const starGeometry = new BufferGeometry();
	const starCount = 950;
	const starPositions = new Float32Array(starCount * 3);

	for (let i = 0; i < starCount; i += 1) {
		const i3 = i * 3;
		starPositions[i3] = (Math.random() - 0.5) * 34;
		starPositions[i3 + 1] = (Math.random() - 0.5) * 22;
		starPositions[i3 + 2] = (Math.random() - 0.5) * 16;
	}

	starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3));

	const stars = new Points(
		starGeometry,
		new PointsMaterial({
			color: 0xcfe2ff,
			size: 1.15,
			sizeAttenuation: false,
			transparent: true,
			opacity: 0.86,
			depthWrite: false,
		}),
	);
	root.add(stars);

	const glowATexture = createBackdropGlowTexture(
		'rgba(173, 203, 255, 0.34)',
		'rgba(173, 203, 255, 0)',
	);
	const glowA = new Sprite(
		new SpriteMaterial({
			map: glowATexture,
			transparent: true,
			opacity: 0.22,
			depthWrite: false,
		}),
	);
	glowA.scale.set(14, 14, 1);
	glowA.position.set(-3.5, 1.4, -6);
	root.add(glowA);

	const glowBTexture = createBackdropGlowTexture(
		'rgba(255, 220, 170, 0.22)',
		'rgba(255, 220, 170, 0)',
	);
	const glowB = new Sprite(
		new SpriteMaterial({
			map: glowBTexture,
			transparent: true,
			opacity: 0.16,
			depthWrite: false,
		}),
	);
	glowB.scale.set(10, 10, 1);
	glowB.position.set(5.2, -3.3, -7);
	root.add(glowB);

	const pointer = { x: 0, y: 0 };
	const clock = new Clock();
	let rafId = 0;

	const onPointerMove = (event) => {
		pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
		pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
	};

	const onResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
	};

	const animate = () => {
		const elapsed = clock.getElapsedTime();
		stars.rotation.z = elapsed * 0.01;
		stars.rotation.x = Math.sin(elapsed * 0.12) * 0.02;
		root.rotation.y += (pointer.x * 0.12 - root.rotation.y) * 0.03;
		root.rotation.x += (-pointer.y * 0.08 - root.rotation.x) * 0.03;
		glowA.rotation.z = elapsed * 0.03;
		glowB.rotation.z = -elapsed * 0.02;
		renderer.render(scene, camera);
		rafId = window.requestAnimationFrame(animate);
	};

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('resize', onResize);
	animate();

	cleanups.push(() => {
		window.cancelAnimationFrame(rafId);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('resize', onResize);
		starGeometry.dispose();
		glowATexture?.dispose();
		glowBTexture?.dispose();
		glowA.material.dispose();
		glowB.material.dispose();
		renderer.dispose();
	});
};

export const startThreeScenes = ({
	backdrop,
	scannerGraphic,
	scannerThreeHost,
	prefersReducedMotion,
	cleanups = [],
}) => {
	if (scannerGraphic && scannerThreeHost) {
		startScannerScene({ scannerGraphic, scannerThreeHost, cleanups });
	}

	if (backdrop && !prefersReducedMotion) {
		startBackdropScene({ backdrop, cleanups });
	}
};
