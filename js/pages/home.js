// SCROLL SMOOTH
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis({
	duration: 1.2, // duração da animação de scroll
	easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easing padrão do Lenis
	orientation: "vertical", // orientação do scroll
	gestureOrientation: "vertical", // orientação dos gestos
	smoothWheel: true, // suaviza o scroll do mouse
	wheelMultiplier: 1, // multiplicador da velocidade do scroll
	smoothTouch: true, // ativa suavização em touch
	touchMultiplier: 2, // multiplicador da velocidade do touch
	infinite: false, // desativa scroll infinito
	autoRaf: false, // Desativamos autoRaf para ter mais controle
	overscroll: true, // Previne o comportamento de "bounce" no scroll
});

// Hero Section Animation
const heroSection = document.querySelector(".section-hero");
const heroTitle = document.querySelector(".hero-title");
let hasScrolled = false; // Flag para controlar se já houve rolagem

if (heroSection && heroTitle) {
	// Configurar o estado inicial do título
	heroTitle.style.opacity = "0";
	heroTitle.style.transform = "translateY(50px)";
	heroTitle.style.transition = "opacity 1s ease-out, transform 1s ease-out";

	// Inicialmente, desativar o scroll
	lenis.stop();

	// Função para verificar a posição do scroll
	const checkScroll = () => {
		try {
			// Se ainda não houve rolagem e o usuário tentou rolar
			if (!hasScrolled) {
				hasScrolled = true;
				// Animar o título
				heroTitle.style.opacity = "1";
				heroTitle.style.transform = "translateY(0)";

				// Ativar o scroll após a animação do título
				setTimeout(() => {
					lenis.start();
				}, 1000);
			}
		} catch (error) {
			console.error("Erro ao verificar scroll:", error);
		}
	};

	// Adicionar o evento de scroll com debounce
	let scrollTimeout;
	lenis.on("scroll", ({ scroll, limit, velocity, direction, animatedScroll }) => {
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(checkScroll, 10);
	});

	// Adicionar eventos para detectar a primeira tentativa de rolagem
	// Para mouse wheel
	window.addEventListener(
		"wheel",
		() => {
			if (!hasScrolled) {
				checkScroll();
			}
		},
		{ once: true }
	);

	// Para touch
	window.addEventListener(
		"touchstart",
		() => {
			if (!hasScrolled) {
				checkScroll();
			}
		},
		{ once: true }
	);

	window.addEventListener(
		"touchmove",
		() => {
			if (!hasScrolled) {
				checkScroll();
			}
		},
		{ once: true }
	);
}

// Loop de animação do Lenis
function raf(time) {
	lenis.raf(time);
	requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// PROJECT ITEM HOVER
// Selecionar todos os elementos .project-item
const projectItems = document.querySelectorAll(".project-item");

// Verificar se não é mobile
if (window.innerWidth > 768) {
	// Adicionar eventos de mouse para cada item
	projectItems.forEach((item) => {
		const media = item.querySelector(".project-item_media");

		// Quando o mouse se mover sobre o item
		item.addEventListener("mousemove", (e) => {
			// Obter as dimensões e posição do viewport
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Obter as dimensões do elemento media
			const mediaRect = media.getBoundingClientRect();
			const mediaWidth = mediaRect.width;
			const mediaHeight = mediaRect.height;

			// Calcular a posição do mouse relativa ao item
			const mouseX = e.clientX;
			const mouseY = e.clientY;

			// Calcular posição desejada (50% à direita do cursor)
			let targetX = mouseX + mediaWidth / 2;
			// Calcular posição Y centralizada no cursor
			let targetY = mouseY - mediaHeight / 1;

			// Ajustar se ultrapassar os limites do viewport
			if (targetX + mediaWidth > viewportWidth) {
				// Se ultrapassar à direita, posicionar à esquerda do cursor
				targetX = mouseX - mediaWidth * 1.5;
			}

			gsap.to(media, {
				opacity: 1,
				scale: 1.05,
				x: targetX - mediaRect.left,
				y: targetY - mediaRect.top,
				duration: 0.3,
				ease: "power2.out",
			});
		});

		// Quando o mouse sair do item
		item.addEventListener("mouseleave", () => {
			gsap.to(media, {
				opacity: 0,
				scale: 1,
				duration: 0.5,
				ease: "power2.out",
			});
		});
	});
}
