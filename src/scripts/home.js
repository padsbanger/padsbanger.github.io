const scannerGraphic = document.querySelector('#scanner-graphic');
const scannerCanvasHost = document.querySelector('#scanner-canvas');
const scannerBootOverlay = document.querySelector('#scanner-boot-overlay');
const scannerBootStatus = document.querySelector('#scanner-boot-status');
const scannerTargets = Array.from(document.querySelectorAll('.scanner-target'));
const scannerSun = document.querySelector('.sun-core');
const scannerPlanets = Array.from(document.querySelectorAll('.node'));
const signalLine = document.querySelector('#signal-line');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cleanups = [];
let signalLineTimer = 0;
let scannerScrollTimer = 0;

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
	window.clearTimeout(scannerScrollTimer);
	scannerScrollTimer = window.setTimeout(() => {
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

	const pulseInterval = window.setInterval(triggerPlanetPulse, 6200);
	const initialPulse = window.setTimeout(triggerPlanetPulse, 2600);

	cleanups.push(() => {
		window.clearInterval(pulseInterval);
		window.clearTimeout(initialPulse);
		window.clearTimeout(signalLineTimer);
		window.clearTimeout(scannerScrollTimer);
	});
}

if (scannerGraphic && scannerBootOverlay && scannerBootStatus && !prefersReducedMotion) {
	scannerGraphic.classList.add('is-booting');
	const bootTimers = [
		window.setTimeout(() => {
			scannerBootStatus.textContent = 'Aligning diagram paths';
		}, 340),
		window.setTimeout(() => {
			scannerBootStatus.textContent = 'Loading section markers';
		}, 700),
		window.setTimeout(() => {
			scannerBootStatus.textContent = 'Capability map ready';
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

const startCanvasScenes = async () => {
	const { startCanvasScenes: startVisualScenes } = await import('./canvas-scenes.js');
	startVisualScenes({
		scannerGraphic,
		scannerCanvasHost,
		cleanups,
	});
};

if (scannerCanvasHost) {
	const scheduleCanvasScenes = () => {
		startCanvasScenes().catch((error) => {
			console.error('Unable to start canvas scenes', error);
		});
	};

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(scheduleCanvasScenes, { timeout: 1600 });
	} else {
		window.setTimeout(scheduleCanvasScenes, 350);
	}
}

window.addEventListener(
	'pagehide',
	() => {
		cleanups.forEach((cleanup) => cleanup());
	},
	{ once: true },
);
