const backdrop = document.querySelector('#three-backdrop');
const scannerGraphic = document.querySelector('#scanner-graphic');
const scannerThreeHost = document.querySelector('#scanner-three');
const scannerBootOverlay = document.querySelector('#scanner-boot-overlay');
const scannerBootStatus = document.querySelector('#scanner-boot-status');
const scannerTargets = Array.from(document.querySelectorAll('.scanner-target'));
const scannerSun = document.querySelector('.sun-core');
const scannerPlanets = Array.from(document.querySelectorAll('.node'));
const signalLine = document.querySelector('#signal-line');
const scannerComet = document.querySelector('#scanner-comet');
const scannerDisturbance = document.querySelector('#scanner-disturbance');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cleanups = [];
let signalLineTimer = 0;
let scannerNavigationTimer = 0;

const restartActivation = (target) => {
	const activeClass = 'is-activated';
	target.classList.remove(activeClass);
	void target.offsetWidth;
	target.classList.add(activeClass);
};

scannerTargets.forEach((target) => {
	target.addEventListener('click', () => restartActivation(target));
});

const updateSignalLine = () => {
	if (!scannerGraphic || !signalLine || !scannerSun) return;
	const selectedPlanet = scannerPlanets.find((planet) => planet.classList.contains('is-selected'));
	if (!selectedPlanet) {
		signalLine.classList.remove('is-visible');
		return;
	}

	const scannerRect = scannerGraphic.getBoundingClientRect();
	const sunRect = scannerSun.getBoundingClientRect();
	const planetRect = selectedPlanet.getBoundingClientRect();
	const sunX = sunRect.left + sunRect.width / 2 - scannerRect.left;
	const sunY = sunRect.top + sunRect.height / 2 - scannerRect.top;
	const planetX = planetRect.left + planetRect.width / 2 - scannerRect.left;
	const planetY = planetRect.top + planetRect.height / 2 - scannerRect.top;
	const deltaX = planetX - sunX;
	const deltaY = planetY - sunY;
	const distance = Math.hypot(deltaX, deltaY);
	const angle = Math.atan2(deltaY, deltaX);

	signalLine.style.left = `${sunX}px`;
	signalLine.style.top = `${sunY}px`;
	signalLine.style.width = `${distance}px`;
	signalLine.style.transform = `translateY(-50%) rotate(${angle}rad)`;
};

const flashSignalLine = () => {
	if (!signalLine) return;
	signalLine.classList.remove('is-visible');
	void signalLine.offsetWidth;
	signalLine.classList.add('is-visible');
	window.clearTimeout(signalLineTimer);
	signalLineTimer = window.setTimeout(() => {
		signalLine.classList.remove('is-visible');
	}, 1150);
};

const setSelectedPlanet = (target) => {
	scannerPlanets.forEach((planet) => {
		planet.classList.toggle('is-selected', planet === target);
	});
	updateSignalLine();
	flashSignalLine();
};

const navigateFromScanner = (target) => {
	const sectionId = target.dataset.section;
	if (!sectionId) return;
	window.clearTimeout(scannerNavigationTimer);
	scannerNavigationTimer = window.setTimeout(() => {
		document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, 180);
};

scannerPlanets.forEach((planet) => {
	planet.addEventListener('click', () => {
		setSelectedPlanet(planet);
		navigateFromScanner(planet);
	});
});

scannerSun?.addEventListener('click', () => {
	scannerPlanets.forEach((planet) => planet.classList.remove('is-selected'));
	window.clearTimeout(signalLineTimer);
	updateSignalLine();
	navigateFromScanner(scannerSun);
});

if (scannerGraphic) {
	const onWindowResize = () => updateSignalLine();
	window.addEventListener('resize', onWindowResize);
	cleanups.push(() => window.removeEventListener('resize', onWindowResize));
}

if (!prefersReducedMotion) {
	const triggerPlanetPulse = () => {
		const target = scannerPlanets[Math.floor(Math.random() * scannerPlanets.length)];
		if (!target) return;
		target.classList.remove('is-pulsing');
		void target.offsetWidth;
		target.classList.add('is-pulsing');
		window.setTimeout(() => target.classList.remove('is-pulsing'), 1200);
	};

	const triggerSunFlare = () => {
		if (!scannerSun) return;
		scannerSun.classList.remove('is-flaring');
		void scannerSun.offsetWidth;
		scannerSun.classList.add('is-flaring');
		window.setTimeout(() => scannerSun.classList.remove('is-flaring'), 1500);
	};

	const triggerCometEvent = () => {
		if (!scannerComet || !scannerDisturbance) return;
		scannerComet.classList.remove('is-active', 'route-b', 'route-c');
		scannerDisturbance.classList.remove('is-active');
		const routeVariants = ['', 'route-b', 'route-c'];
		const routeClass = routeVariants[Math.floor(Math.random() * routeVariants.length)];
		if (routeClass) {
			scannerComet.classList.add(routeClass);
		}
		void scannerComet.offsetWidth;
		scannerComet.classList.add('is-active');
		window.setTimeout(() => scannerDisturbance.classList.add('is-active'), 620);
		window.setTimeout(() => scannerDisturbance.classList.remove('is-active'), 1550);
		window.setTimeout(() => scannerComet.classList.remove('is-active'), 2200);
	};

	const pulseInterval = window.setInterval(triggerPlanetPulse, 6200);
	const flareInterval = window.setInterval(triggerSunFlare, 9800);
	const cometInterval = window.setInterval(triggerCometEvent, 16800);
	const initialPulse = window.setTimeout(triggerPlanetPulse, 2600);
	const initialFlare = window.setTimeout(triggerSunFlare, 5200);

	cleanups.push(() => {
		window.clearInterval(pulseInterval);
		window.clearInterval(flareInterval);
		window.clearInterval(cometInterval);
		window.clearTimeout(initialPulse);
		window.clearTimeout(initialFlare);
		window.clearTimeout(signalLineTimer);
		window.clearTimeout(scannerNavigationTimer);
	});
}

if (scannerGraphic && scannerBootOverlay && scannerBootStatus && !prefersReducedMotion) {
	scannerGraphic.classList.add('is-booting');
	const bootTimers = [
		window.setTimeout(() => {
			scannerBootStatus.textContent = 'Calibrating orbital paths';
		}, 340),
		window.setTimeout(() => {
			scannerBootStatus.textContent = 'Locking stellar signatures';
		}, 700),
		window.setTimeout(() => {
			scannerBootStatus.textContent = 'Navigation map online';
		}, 1020),
		window.setTimeout(() => {
			scannerBootOverlay.classList.add('is-hidden');
		}, 1240),
		window.setTimeout(() => {
			scannerGraphic.classList.remove('is-booting', 'scanner-boot');
		}, 1460),
	];

	cleanups.push(() => {
		bootTimers.forEach((timer) => window.clearTimeout(timer));
	});
}

const startThreeScenes = async () => {
	const THREE = await import('three');

if (scannerGraphic && scannerThreeHost) {
	const scene = new THREE.Scene();
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	camera.position.z = 1;

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
	renderer.setClearColor(0x000000, 0);
	scannerThreeHost.append(renderer.domElement);
	const dustGroup = new THREE.Group();
	const shimmerGroup = new THREE.Group();
	scene.add(dustGroup, shimmerGroup);

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
				const radius = THREE.MathUtils.lerp(band.innerRadius, band.outerRadius, Math.random());
				const spreadX = width * radius * (0.85 + Math.random() * 0.15);
				const spreadY = height * radius * (0.85 + Math.random() * 0.15);
				points.push(
					new THREE.Vector3(
						Math.cos(angle) * spreadX * 0.5 + (Math.random() - 0.5) * 6,
						Math.sin(angle) * spreadY * 0.5 + (Math.random() - 0.5) * 6,
						0,
					),
				);
			}

			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			const material = new THREE.PointsMaterial({
				color: band.color,
				size: bandIndex === 0 ? 1.1 : 0.9,
				sizeAttenuation: false,
				transparent: true,
				opacity: band.opacity,
				depthWrite: false,
			});
			const dust = new THREE.Points(geometry, material);
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

		const texture = new THREE.CanvasTexture(shimmerCanvas);
		const sprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
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
	const scannerClock = new THREE.Clock();
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
}

if (backdrop && !prefersReducedMotion) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.z = 18;

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000, 0);
	backdrop.append(renderer.domElement);

	const root = new THREE.Group();
	scene.add(root);
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
		return new THREE.CanvasTexture(canvas);
	};

	const starGeometry = new THREE.BufferGeometry();
	const starCount = 700;
	const starPositions = new Float32Array(starCount * 3);

	for (let i = 0; i < starCount; i += 1) {
		const i3 = i * 3;
		starPositions[i3] = (Math.random() - 0.5) * 34;
		starPositions[i3 + 1] = (Math.random() - 0.5) * 22;
		starPositions[i3 + 2] = (Math.random() - 0.5) * 16;
	}

	starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

	const stars = new THREE.Points(
		starGeometry,
		new THREE.PointsMaterial({
			color: 0xcfe2ff,
			size: 0.05,
			transparent: true,
			opacity: 0.75,
			depthWrite: false,
		}),
	);
	root.add(stars);

	const glowATexture = createBackdropGlowTexture(
		'rgba(173, 203, 255, 0.34)',
		'rgba(173, 203, 255, 0)',
	);
	const glowA = new THREE.Sprite(
		new THREE.SpriteMaterial({
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
	const glowB = new THREE.Sprite(
		new THREE.SpriteMaterial({
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
	const clock = new THREE.Clock();
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
}
};

if (scannerThreeHost || (backdrop && !prefersReducedMotion)) {
	const scheduleThreeScenes = () => {
		startThreeScenes().catch((error) => {
			console.error('Unable to start Three.js scenes', error);
		});
	};

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(scheduleThreeScenes, { timeout: 1600 });
	} else {
		window.setTimeout(scheduleThreeScenes, 350);
	}
}

window.addEventListener(
	'pagehide',
	() => {
		cleanups.forEach((cleanup) => cleanup());
	},
	{ once: true },
);
