//========================================
// INICIALIZAÇÃO ESPECÍFICA DA HOME
//========================================

document.addEventListener("DOMContentLoaded", function () {
	// Inicializar mouse tracking do logo apenas se o SVG existir
	// Isso evita conflitos com outras animações de logo (hero/footer)
	if (document.getElementById("logo-svg")) {
		new MouseTrackingLogo();
	}

	// Executar animações específicas da home
	initHeroLogoAnimation();
	initFooterLogoAnimation();
});

//========================================
// MOUSE TRACKING LOGO
//========================================

class MouseTrackingLogo {
	constructor() {
		this.svg = document.getElementById("logo-svg");

		// Verificar se o SVG existe antes de continuar
		if (!this.svg) {
			console.warn("MouseTrackingLogo: SVG com ID 'logo-svg' não encontrado");
			return;
		}

		// Selecionar todos os grupos de letras dentro do SVG
		this.letters = this.svg.querySelectorAll(".letter_group");
		this.maxBlur = 12;
		this.maxDistance = Math.max(window.innerWidth, window.innerHeight) * 0.5; // 50% do viewport
		this.animationDuration = 0.3; // Duração da animação em segundos
		this.easing = "power2.out"; // Easing para suavidade

		this.init();
	}

	init() {
		// Verificar se temos letras válidas
		if (!this.letters || this.letters.length === 0) {
			console.warn("MouseTrackingLogo: Nenhuma letra encontrada no SVG");
			return;
		}

		// Adicionar evento de mouse move
		document.addEventListener("mousemove", (e) => this.handleMouseMove(e));

		// Inicializar posições das letras
		this.updateLetterPositions();

		// Atualizar posições quando a janela for redimensionada
		window.addEventListener("resize", () => {
			this.updateLetterPositions();
			this.maxDistance = Math.max(window.innerWidth, window.innerHeight) * 0.5;
		});
	}

	updateLetterPositions() {
		// Verificar se o SVG ainda existe e é válido
		if (!this.svg || !this.letters) {
			return;
		}

		this.letterPositions = [];

		this.letters.forEach((letterGroup, index) => {
			const bbox = letterGroup.getBBox();
			const svgRect = this.svg.getBoundingClientRect();
			const svgViewBox = this.svg.viewBox.baseVal;

			// Calcular a escala do SVG
			const scaleX = svgRect.width / svgViewBox.width;
			const scaleY = svgRect.height / svgViewBox.height;

			// Calcular posição central da letra no viewport
			const centerX = svgRect.left + (bbox.x + bbox.width / 2) * scaleX;
			const centerY = svgRect.top + (bbox.y + bbox.height / 2) * scaleY;

			// Adicionar posição da letra
			this.letterPositions.push({
				x: centerX,
				y: centerY,
				element: letterGroup,
			});
		});
	}

	handleMouseMove(event) {
		// Verificar se temos posições válidas das letras
		if (!this.letterPositions || this.letterPositions.length === 0) {
			return;
		}

		const mouseX = event.clientX;
		const mouseY = event.clientY;

		// Calcular posição normalizada do mouse no viewport (0-1)
		const normalizedMouseX = mouseX / window.innerWidth;
		const normalizedMouseY = mouseY / window.innerHeight;

		this.letterPositions.forEach((letterPos) => {
			// Calcular posição normalizada da letra no viewport (0-1)
			const normalizedLetterX = letterPos.x / window.innerWidth;
			const normalizedLetterY = letterPos.y / window.innerHeight;

			// Calcular distância normalizada
			const deltaX = normalizedMouseX - normalizedLetterX;
			const deltaY = normalizedMouseY - normalizedLetterY;
			const normalizedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			// Converter para distância real usando uma escala baseada no viewport
			const viewportDiagonal = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
			const distance = normalizedDistance * viewportDiagonal;

			// Calcular valor do blur baseado na distância
			let targetBlurValue;
			if (distance <= this.maxDistance) {
				// Interpolação linear: quanto mais perto, mais blur
				const proximity = 1 - distance / this.maxDistance;
				targetBlurValue = this.maxBlur * proximity;
			} else {
				targetBlurValue = 0;
			}

			// Garantir que o valor está entre 0 e 12
			targetBlurValue = Math.max(0, Math.min(this.maxBlur, targetBlurValue));

			// Usar GSAP para animar o CSS filter blur suavemente
			gsap.to(letterPos.element, {
				filter: `blur(${targetBlurValue}px)`,
				duration: this.animationDuration,
				ease: this.easing,
			});
		});
	}
}

//========================================
// ANIMAÇÕES DOS LOGOS
//========================================

// HERO LOGO
// Anima blur de 32px para 0px e opacity de 0 para 100% ao carregar a página
function initHeroLogoAnimation() {
	// Configuração inicial - definir estado inicial dos elementos .letter
	gsap.set(".section_hero_logo .letter_group", {
		filter: "blur(32px)",
		opacity: 0,
	});

	// Configuração inicial do background
	gsap.set(".section_hero-background", {
		opacity: 0,
	});

	// Criar timeline para a animação
	let heroLogoTimeline = gsap.timeline();

	// Fade in do background primeiro
	heroLogoTimeline.to(".section_hero-background", {
		opacity: 1,
		duration: 0.8,
		ease: "power2.out",
	});

	// Adicionar animação das letras com ordem aleatória
	// Obter todos os elementos .letter-group e embaralhar
	let heroLetterGroups = gsap.utils.toArray(".section_hero_logo .letter_group");
	let heroShuffledGroups = gsap.utils.shuffle([...heroLetterGroups]);

	heroLogoTimeline.to(
		heroShuffledGroups,
		{
			filter: "blur(0px)",
			opacity: 1,
			duration: 1.5,
			stagger: 0.1, // Delay entre cada letra
			ease: "power2.out",
		},
		"+=0.2"
	); // Inicia 0.2s após o background terminar
}

// FOOTER LOGO
// Anima blur de 20px para 0px e opacity de 0 para 100% quando entrar no viewport
function initFooterLogoAnimation() {
	// Configuração inicial - definir estado inicial dos elementos .letter
	gsap.set(".footer_logo .letter-group", {
		filter: "blur(20px)",
		opacity: 0,
	});

	// Criar timeline para a animação
	let footerLogoTimeline = gsap.timeline({
		scrollTrigger: {
			trigger: ".footer_logo",
			start: "top 80%", // Inicia quando o elemento está 80% visível na tela
			end: "bottom 20%",
			toggleActions: "play none none reverse", // Play ao entrar, reverse ao sair
			// markers: true // Descomente para debug
		},
	});

	// Adicionar animação das letras com ordem aleatória
	// Obter todos os elementos .letter-group e embaralhar
	let letterGroups = gsap.utils.toArray(".footer_logo .letter-group");
	let shuffledGroups = gsap.utils.shuffle([...letterGroups]);

	footerLogoTimeline.to(shuffledGroups, {
		filter: "blur(0px)",
		opacity: 1,
		duration: 1.5,
		stagger: 0.1, // Delay entre cada letra
		ease: "power2.out",
	});
}
