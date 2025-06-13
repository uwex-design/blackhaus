// SCROLL SMOOTH
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis({
	duration: 0.8,
	easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
	orientation: "vertical",
	gestureOrientation: "vertical",
	smoothWheel: true,
	wheelMultiplier: 1.5,
	smoothTouch: true,
	touchMultiplier: 2.5,
	infinite: false,
	autoRaf: false,
	overscroll: true,
});

// Project Hero Section Animation
const projectHeroSection = document.querySelector(".project-hero_content");
const projectHeroOverlay = document.querySelector(".project-hero_overlay");
let hasScrolled = false;
let isAnimating = false;
let lastScrollY = window.scrollY;

if (projectHeroSection && projectHeroOverlay) {
	// Configurar o estado inicial
	projectHeroSection.style.opacity = "1";
	projectHeroOverlay.style.opacity = "1";
	projectHeroSection.style.transition = "opacity 0.6s ease-out";
	projectHeroOverlay.style.transition = "opacity 0.6s ease-out";

	// Função para resetar o estado inicial
	const resetState = () => {
		if (isAnimating) return;
		isAnimating = true;

		projectHeroSection.style.opacity = "1";
		projectHeroOverlay.style.opacity = "1";
		hasScrolled = false;
		lenis.stop();

		setTimeout(() => {
			isAnimating = false;
		}, 600);
	};

	// Função para verificar a posição do scroll
	const checkScroll = () => {
		try {
			if (!hasScrolled && !isAnimating) {
				isAnimating = true;
				hasScrolled = true;

				// Animar os elementos para ficarem transparentes
				projectHeroSection.style.opacity = "0";
				projectHeroOverlay.style.opacity = "0";

				// Ativar o scroll após a animação
				setTimeout(() => {
					lenis.start();
					isAnimating = false;
				}, 600);
			}
		} catch (error) {
			console.error("Erro ao verificar scroll:", error);
			isAnimating = false;
		}
	};

	// Verificar posição inicial do scroll
	if (window.scrollY === 0) {
		resetState();
	} else {
		hasScrolled = true;
		projectHeroSection.style.opacity = "0";
		projectHeroOverlay.style.opacity = "0";
	}

	// Adicionar o evento de scroll com debounce
	let scrollTimeout;
	lenis.on("scroll", ({ scroll, limit, velocity, direction, animatedScroll }) => {
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			// Só executa se não estiver animando
			if (isAnimating) return;

			// Verifica se está no topo
			if (scroll <= 0) {
				resetState();
			} else if (!hasScrolled) {
				// Executa o checkScroll se estiver rolando para baixo
				if (scroll > lastScrollY) {
					checkScroll();
				}
			}

			lastScrollY = scroll;
		}, 10);
	});

	// Adicionar eventos para detectar a primeira tentativa de rolagem
	// Para mouse wheel
	window.addEventListener(
		"wheel",
		(e) => {
			if (!hasScrolled && !isAnimating && e.deltaY > 0) {
				checkScroll();
			}
		},
		{ passive: true }
	);

	// Para touch
	let touchStartY = 0;
	window.addEventListener(
		"touchstart",
		(e) => {
			touchStartY = e.touches[0].clientY;
		},
		{ passive: true }
	);

	window.addEventListener(
		"touchmove",
		(e) => {
			if (!hasScrolled && !isAnimating) {
				const touchY = e.touches[0].clientY;
				if (touchY < touchStartY) {
					// Rolando para baixo
					checkScroll();
				}
			}
		},
		{ passive: true }
	);
}

// Loop de animação do Lenis
function raf(time) {
	lenis.raf(time);
	requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
