/**
 * BlackHaus Gallery - Sistema de galeria com animações customizadas
 * Utiliza Fancybox + GSAP para criar experiência visual aprimorada
 */
class BlackHausGallery {
	/**
	 * Configurações padrão da galeria
	 */
	static CONFIG = {
		// Seletores dos elementos
		selectors: {
			dialog: ".fancybox__dialog",
			viewport: ".fancybox__viewport",
			toolbar: ".f-carousel__toolbar",
			thumbs: ".f-thumbs",
			backdrop: ".fancybox__backdrop",
			caption: ".f-caption",
			activeSlideCaption: ".fancybox__slide.is-selected .f-caption",
			nextButton: "[data-carousel-go-next], .f-button.is-arrow.is-next",
			prevButton: "[data-carousel-go-prev], .f-button.is-arrow.is-prev",
			closeButton: "[data-fancybox-close]",
			galleryTrigger: "[data-fancybox]",
			container: ".fancybox__container",
			slide: ".fancybox__slide",
		},

		// Configurações de animação
		animations: {
			// Durações em segundos
			durations: {
				toolbar: 0.6,
				viewport: 1,
				backdrop: 1,
				slide: 0.8,
			},
			// Easings
			easings: {
				in: "power2.out",
				out: "power2.in",
			},
			// Offsets para sincronização
			offsets: {
				viewport: "-=0.1",
				backdrop: "-=0.2",
				toolbar: "-=0.2",
				caption: "+=0.3",
				nextButton: "-=0.2",
				prevButton: "-=0.2",
			},
		},

		// Configurações do Fancybox
		fancybox: {
			mainStyle: {
				"--f-button-border-radius": "0",
				"--f-arrow-border-radius": "0",
				"--f-arrow-bg": "transparent",
				"--f-button-bg": "transparent",
				"--fancybox-backdrop-bg": "rgba(0, 0, 0, 1)",
				"--f-button-color": "#8d8a7a",
				"--f-arrow-color": "#8d8a7a",
				"--f-arrow-svg-width": "32px",
				"--f-arrow-svg-height": "32px",
				"--f-arrow-svg-stroke-width": "1px",
				"--f-button-svg-stroke-width": "1px",
			},
			hideScrollbar: true,
			animated: false, // Desabilita animações padrão do Fancybox
			showClass: false,
			hideClass: false,
			backdropClick: false, // Desativa o clique fora para fechar
			zoomEffect: false,
			placeFocusBack: false, // Desabilita scroll automático padrão
			Carousel: {
				formatCaption: (_carouselRef, slide) => {
					return slide.triggerEl?.lastElementChild || "";
				},
				transition: "fade",
				Toolbar: {
					display: {
						left: [],
						middle: ["thumbs"],
						right: ["close"],
					},
				},
				Thumbs: {
					showOnStart: false,
					type: "classic",
				},
				Zoomable: {
					Panzoom: {
						maxScale: 0,
					},
				},
			},
		},

		// Delays
		delays: {
			openAnimation: 50,
			elementDetection: 100, // Delay para detectar elementos dinâmicos
		},
	};

	/**
	 * Construtor da classe
	 */
	constructor() {
		this.isClosingWithAnimation = false;
		this.isOpeningWithAnimation = false;
		this.elementsCache = new Map();
		this.dynamicElementsAnimated = false;
		this.currentFancyboxInstance = null;

		this.init();
	}

	/**
	 * Inicializa a galeria
	 */
	init() {
		this.autoPopulateDataSrc();
		this.setupEventListeners();
		this.setupFancybox();
	}

	/**
	 * Preenche automaticamente o data-src dos elementos com data-fancybox
	 * usando a URL da imagem filha
	 * @param {Element|Document} container - Container para buscar elementos (padrão: document)
	 */
	autoPopulateDataSrc(container = document) {
		const fancyboxElements = container.querySelectorAll("[data-fancybox]");

		fancyboxElements.forEach((element) => {
			this.populateElementDataSrc(element);
		});
	}

	/**
	 * Preenche o data-src de um elemento específico
	 * @param {Element} element - Elemento com data-fancybox
	 */
	populateElementDataSrc(element) {
		// Se já tem data-src, não sobrescreve
		if (element.hasAttribute("data-src")) {
			return;
		}

		// Busca por imagem filha
		const img = element.querySelector("img");

		if (img) {
			// Prioriza data-src da imagem, depois src
			const imageSrc = img.getAttribute("data-src") || img.getAttribute("src");

			if (imageSrc) {
				element.setAttribute("data-src", imageSrc);
			}
		}
	}

	/**
	 * Obtém elementos DOM com cache para otimização
	 * @param {boolean} forceRefresh - Força atualização do cache
	 * @returns {Object} Objeto com elementos DOM
	 */
	getElements(forceRefresh = false) {
		const cacheKey = "fancybox-elements";

		if (!forceRefresh && this.elementsCache.has(cacheKey)) {
			return this.elementsCache.get(cacheKey);
		}

		const containerEl = document.querySelector(BlackHausGallery.CONFIG.selectors.container);

		const elements = {
			dialog: document.querySelector(BlackHausGallery.CONFIG.selectors.dialog),
			viewport: document.querySelector(BlackHausGallery.CONFIG.selectors.viewport),
			toolbar: document.querySelector(BlackHausGallery.CONFIG.selectors.toolbar),
			thumbs: document.querySelector(BlackHausGallery.CONFIG.selectors.thumbs),
			backdrop: document.querySelector(BlackHausGallery.CONFIG.selectors.backdrop),
			caption: (containerEl && containerEl.querySelector(BlackHausGallery.CONFIG.selectors.activeSlideCaption)) || (containerEl && containerEl.querySelector(BlackHausGallery.CONFIG.selectors.caption)) || document.querySelector(BlackHausGallery.CONFIG.selectors.activeSlideCaption) || document.querySelector(BlackHausGallery.CONFIG.selectors.caption),
			nextButton: document.querySelector(BlackHausGallery.CONFIG.selectors.nextButton),
			prevButton: document.querySelector(BlackHausGallery.CONFIG.selectors.prevButton),
			container: containerEl,
		};

		this.elementsCache.set(cacheKey, elements);
		return elements;
	}

	/**
	 * Limpa o cache de elementos
	 */
	clearElementsCache() {
		this.elementsCache.clear();
	}

	/**
	 * Anima elementos dinâmicos quando o carousel está pronto
	 */
	animateDynamicElements() {
		// Evitar múltiplas execuções
		if (this.dynamicElementsAnimated) {
			return;
		}

		// Aguardar um pouco para garantir que os elementos estejam prontos
		setTimeout(() => {
			const container = document.querySelector(BlackHausGallery.CONFIG.selectors.container);
			if (!container) return;

			const { durations, easings } = BlackHausGallery.CONFIG.animations;

			// Buscar elementos dinâmicos dentro do container
			const caption = container.querySelector(BlackHausGallery.CONFIG.selectors.activeSlideCaption) || container.querySelector(BlackHausGallery.CONFIG.selectors.caption);
			const nextButton = container.querySelector(".f-button.is-arrow.is-next");
			const prevButton = container.querySelector(".f-button.is-arrow.is-prev");
			const closeButton = container.querySelector("[data-fancybox-close]");
			const thumbs = container.querySelector(".f-thumbs");

			// Marcar como animado
			this.dynamicElementsAnimated = true;

			// Animar caption (por último) - fade-up
			if (caption) {
				// Garantir estado inicial antes de animar (útil ao trocar de slide)
				gsap.set(caption, { opacity: 0, y: 20, visibility: "visible" });
				gsap.to(caption, {
					duration: durations.toolbar,
					opacity: 1,
					y: 0,
					visibility: "visible",
					ease: easings.in,
					delay: 0.2,
				});
			}

			// Animar thumbs se existir
			if (thumbs) {
				gsap.to(thumbs, {
					duration: durations.toolbar,
					opacity: 1,
					y: 0,
					visibility: "visible",
					ease: easings.in,
					delay: 0.4,
				});
			}

			// Animar botões - fade-in
			const buttons = [nextButton, prevButton, closeButton].filter(Boolean);
			buttons.forEach((button, index) => {
				gsap.to(button, {
					duration: durations.toolbar * 0.5,
					opacity: 1,
					visibility: "visible",
					ease: easings.in,
					delay: 0.3 + index * 0.1,
				});
			});
		}, BlackHausGallery.CONFIG.delays.elementDetection);
	}

	/**
	 * Verifica se os elementos necessários existem
	 * @param {Object} elements - Elementos DOM
	 * @returns {boolean}
	 */
	hasRequiredElements(elements) {
		return Object.values(elements).some((element) => element !== null);
	}

	/**
	 * Obtém instância ativa do Fancybox
	 * @returns {Object|null}
	 */
	getFancyboxInstance() {
		try {
			return Fancybox.getInstance();
		} catch (error) {
			console.warn("BlackHausGallery: Erro ao obter instância do Fancybox:", error);
			return null;
		}
	}

	/**
	 * Para propagação de eventos
	 * @param {Event} event
	 */
	stopEventPropagation(event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	/**
	 * Anima o fechamento do fancybox
	 * @param {Object} fancyboxInstance - Instância do Fancybox
	 */
	animateClose(fancyboxInstance) {
		if (this.isClosingWithAnimation) return;

		this.isClosingWithAnimation = true;
		const elements = this.getElements(true); // Força refresh dos elementos

		if (!this.hasRequiredElements(elements)) {
			this.fallbackClose(fancyboxInstance);
			return;
		}

		const { durations, easings, offsets } = BlackHausGallery.CONFIG.animations;

		// Timeline para animação sequencial de fechamento
		const timeline = gsap.timeline({
			onComplete: () => this.onCloseAnimationComplete(fancyboxInstance),
		});

		// 1. Fade-out dos controles (incluindo thumbs)
		const controls = [elements.toolbar, elements.thumbs, elements.nextButton, elements.prevButton].filter(Boolean);
		timeline.to(controls, {
			duration: durations.toolbar,
			opacity: 0,
			visibility: "hidden",
			ease: easings.out,
		});

		// 1.1. Fade-out do caption com movimento
		if (elements.caption) {
			timeline.to(
				elements.caption,
				{
					duration: durations.toolbar,
					opacity: 0,
					y: 20,
					ease: easings.out,
				},
				0 // Iniciar ao mesmo tempo que os outros controles
			);
		}

		// 2. Fade-out do viewport
		timeline.to(
			elements.viewport,
			{
				duration: durations.viewport,
				opacity: 0,
				ease: easings.out,
				clipPath: "inset(0 0 100% 0)",
			},
			offsets.viewport
		);

		// 3. Slide-out do backdrop
		timeline.to(
			elements.backdrop,
			{
				duration: durations.backdrop,
				y: "100%",
				ease: easings.out,
			},
			offsets.backdrop
		);
	}

	/**
	 * Callback executado quando a animação de fechamento termina
	 * @param {Object} fancyboxInstance
	 */
	onCloseAnimationComplete(fancyboxInstance) {
		this.isClosingWithAnimation = false;
		this.dynamicElementsAnimated = false; // Resetar flag para próxima abertura
		this.clearElementsCache();

		if (fancyboxInstance) {
			// Fazer scroll suave para a imagem ativa antes de fechar
			this.scrollToActiveTrigger(fancyboxInstance);
			fancyboxInstance.close();
		}
	}

	/**
	 * Faz scroll suave até o elemento que disparou o fancybox (slide ativo)
	 * @param {Object} fancyboxInstance - Instância do Fancybox
	 */
	scrollToActiveTrigger(fancyboxInstance) {
		try {
			// Obter o elemento que disparou o fancybox (slide ativo)
			const triggerElement = this.getActiveTriggerElement(fancyboxInstance);

			if (!triggerElement) {
				console.warn("Elemento trigger não encontrado para o slide ativo");
				return;
			}

			// Verificar se o elemento está visível no viewport
			if (this.isElementInViewport(triggerElement)) {
				console.log("Elemento já está visível, não é necessário scroll");
				return;
			}

			// Log para debug
			const slideIndex = fancyboxInstance?.getPageIndex?.() || 0;
			console.log(`Fazendo scroll para o slide ativo (índice: ${slideIndex})`);

			// Calcular posição do elemento com offset
			const elementRect = triggerElement.getBoundingClientRect();
			const offsetTop = window.pageYOffset + elementRect.top - 100; // Offset de 100px do topo

			// Scroll suave usando scrollTo nativo
			window.scrollTo({
				top: offsetTop,
				behavior: "smooth",
			});
		} catch (error) {
			console.warn("Erro ao fazer scroll para elemento ativo:", error);
		}
	}

	/**
	 * Obtém o elemento que disparou o fancybox atual (slide ativo)
	 * @param {Object} fancyboxInstance - Instância do Fancybox
	 * @returns {HTMLElement|null} Elemento que disparou o fancybox
	 */
	getActiveTriggerElement(fancyboxInstance) {
		try {
			// Obter o slide que está atualmente ativo/visível
			const currentSlide = fancyboxInstance?.getSlide();

			// Fallback: se getSlide() não funcionar, usar getPage()
			const fallbackSlide = currentSlide || fancyboxInstance?.getPage()?.slides[0];

			if (currentSlide || fallbackSlide) {
				const slide = currentSlide || fallbackSlide;

				// Primeiro tentar triggerEl (elemento específico que disparou)
				if (slide.triggerEl) {
					return slide.triggerEl;
				}

				// Fallback: procurar por data-fancybox com mesmo grupo usando o índice do slide ativo
				const fancyboxGroup = slide.fancybox;
				if (fancyboxGroup) {
					const triggers = document.querySelectorAll(`[data-fancybox="${fancyboxGroup}"]`);
					// Usar o índice do slide atual, não sempre 0
					const slideIndex = slide.index !== undefined ? slide.index : fancyboxInstance?.getPageIndex() || 0;

					if (triggers[slideIndex]) {
						return triggers[slideIndex];
					}
				}

				// Último fallback: procurar por src/href similar
				if (slide.src) {
					const similarTrigger = document.querySelector(`[href="${slide.src}"], [data-src="${slide.src}"]`);
					if (similarTrigger) {
						return similarTrigger;
					}
				}
			}

			return null;
		} catch (error) {
			console.warn("Erro ao obter elemento trigger:", error);
			return null;
		}
	}

	/**
	 * Verifica se um elemento está visível no viewport
	 * @param {HTMLElement} element - Elemento a verificar
	 * @returns {boolean} True se visível, false caso contrário
	 */
	isElementInViewport(element) {
		if (!element) return false;

		try {
			const rect = element.getBoundingClientRect();
			const windowHeight = window.innerHeight || document.documentElement.clientHeight;
			const windowWidth = window.innerWidth || document.documentElement.clientWidth;

			return rect.bottom > 0 && rect.right > 0 && rect.left < windowWidth && rect.top < windowHeight;
		} catch (error) {
			console.warn("Erro ao verificar viewport:", error);
			return false;
		}
	}

	/**
	 * Fechamento de fallback quando elementos não são encontrados
	 * @param {Object} fancyboxInstance
	 */
	fallbackClose(fancyboxInstance) {
		console.warn("BlackHausGallery: Elementos não encontrados, usando fechamento padrão");
		this.isClosingWithAnimation = false;

		if (fancyboxInstance) {
			fancyboxInstance.close();
		}
	}

	/**
	 * Anima a abertura do fancybox
	 */
	animateOpen() {
		if (this.isOpeningWithAnimation) return;

		this.isOpeningWithAnimation = true;

		// Aguardar um pouco para garantir que o DOM esteja pronto
		setTimeout(() => {
			const elements = this.getElements(true); // Força refresh dos elementos

			if (!this.hasRequiredElements(elements)) {
				console.warn("BlackHausGallery: Elementos não encontrados para animação de abertura");
				this.isOpeningWithAnimation = false;
				return;
			}

			// Verificar se o container está pronto
			const container = document.querySelector(BlackHausGallery.CONFIG.selectors.container);
			if (!container) {
				console.warn("BlackHausGallery: Container do Fancybox não encontrado");
				this.isOpeningWithAnimation = false;
				return;
			}

			this.setInitialState(elements);
			this.createOpenTimeline(elements, container);
		}, BlackHausGallery.CONFIG.delays.openAnimation);
	}

	/**
	 * Define estado inicial dos elementos para animação de abertura
	 * @param {Object} elements
	 */
	setInitialState(elements) {
		// Dialog
		if (elements.dialog) {
			gsap.set(elements.dialog, { opacity: 0 });
		}

		// Backdrop
		if (elements.backdrop) {
			gsap.set(elements.backdrop, { y: "100%" });
		}

		// Toolbar
		if (elements.toolbar) {
			gsap.set(elements.toolbar, {
				opacity: 0,
				visibility: "hidden",
			});
		}

		// Thumbs
		if (elements.thumbs) {
			gsap.set(elements.thumbs, {
				opacity: 0,
				visibility: "hidden",
				y: 20,
			});
		}

		// Botões de navegação
		if (elements.nextButton) {
			gsap.set(elements.nextButton, { opacity: 0, visibility: "hidden" });
		}
		if (elements.prevButton) {
			gsap.set(elements.prevButton, { opacity: 0, visibility: "hidden" });
		}

		// Viewport
		if (elements.viewport) {
			gsap.set(elements.viewport, {
				opacity: 0,
				clipPath: "inset(0 0 100% 0)",
			});
		}

		// Caption
		if (elements.caption) {
			gsap.set(elements.caption, {
				opacity: 0,
				y: 20,
			});
		}
	}

	/**
	 * Cria timeline de animação de abertura
	 * @param {Object} elements
	 */
	createOpenTimeline(elements, container) {
		const { durations, easings, offsets } = BlackHausGallery.CONFIG.animations;
		const timeline = gsap.timeline({
			onComplete: () => {
				this.isOpeningWithAnimation = false;
				// Animar elementos dinâmicos após a abertura
				this.animateDynamicElements();
			},
		});

		// 0. Dialog
		if (elements.dialog) {
			timeline.to(elements.dialog, {
				duration: 0,
				opacity: 1,
				ease: easings.in,
			});
		}

		// 1. Backdrop slide-in
		if (elements.backdrop) {
			timeline.to(elements.backdrop, {
				duration: durations.backdrop,
				y: "0%",
				ease: easings.in,
			});
		}

		// 2. Viewport fade-in
		if (elements.viewport) {
			timeline.to(
				elements.viewport,
				{
					duration: durations.viewport,
					opacity: 1,
					clipPath: "inset(0 0 0% 0)",
					ease: easings.in,
				},
				offsets.backdrop
			);
		}

		// 3. Toolbar fade-in
		if (elements.toolbar) {
			timeline.to(
				elements.toolbar,
				{
					duration: durations.toolbar,
					opacity: 1,
					visibility: "visible",
					ease: easings.in,
				},
				offsets.toolbar
			);
		}
	}

	/**
	 * Manipula clique em elemento de fechamento
	 * @param {Event} event
	 */
	handleCloseClick(event) {
		const closeElement = event.target.closest(BlackHausGallery.CONFIG.selectors.closeButton);

		if (closeElement && !this.isClosingWithAnimation) {
			this.stopEventPropagation(event);

			const fancyboxInstance = this.getFancyboxInstance();
			if (fancyboxInstance) {
				this.animateClose(fancyboxInstance);
			}
		}
	}

	/**
	 * Manipula clique no backdrop
	 * @param {Event} event
	 */
	handleBackdropClick(event) {
		if (event.target.classList.contains("fancybox__backdrop") && !this.isClosingWithAnimation) {
			this.stopEventPropagation(event);

			const fancyboxInstance = this.getFancyboxInstance();
			if (fancyboxInstance) {
				this.animateClose(fancyboxInstance);
			}
		}
	}

	/**
	 * Manipula tecla ESC
	 * @param {Event} event
	 */
	handleEscapeKey(event) {
		if (event.key === "Escape" && !this.isClosingWithAnimation) {
			const fancyboxInstance = this.getFancyboxInstance();

			if (fancyboxInstance) {
				this.stopEventPropagation(event);
				this.animateClose(fancyboxInstance);
			}
		}
	}

	/**
	 * Configura event listeners
	 */
	setupEventListeners() {
		// Interceptar cliques de fechamento
		document.addEventListener("click", (e) => this.handleCloseClick(e), true);

		// Interceptar cliques no backdrop
		document.addEventListener("click", (e) => this.handleBackdropClick(e), true);

		// Interceptar tecla ESC
		document.addEventListener("keydown", (e) => this.handleEscapeKey(e), true);
	}

	/**
	 * Configura o Fancybox
	 */
	setupFancybox() {
		const config = {
			...BlackHausGallery.CONFIG.fancybox,
			on: {
				init: (fancybox) => {
					// Armazenar instância atual
					this.currentFancyboxInstance = fancybox;
				},
				ready: () => {
					// Executar animação quando Fancybox está pronto
					this.animateOpen();
				},
				"Carousel.change": () => {
					// Reset flag quando muda de slide para permitir nova animação
					this.dynamicElementsAnimated = false;
					setTimeout(() => {
						this.animateDynamicElements();
					}, 100);
				},
				destroy: () => {
					// Resetar flags quando Fancybox é destruído
					this.dynamicElementsAnimated = false;
					this.isOpeningWithAnimation = false;
					this.isClosingWithAnimation = false;
					this.currentFancyboxInstance = null;
					this.clearElementsCache();
				},
			},
		};

		Fancybox.bind(BlackHausGallery.CONFIG.selectors.galleryTrigger, config);
	}

	/**
	 * Método público para preencher data-src manualmente
	 * Útil para conteúdo adicionado dinamicamente
	 * @param {Element|Document} container - Container para buscar elementos
	 * @returns {number} Número de elementos processados
	 */
	refreshDataSrc(container = document) {
		const elementsBefore = container.querySelectorAll("[data-fancybox]").length;
		this.autoPopulateDataSrc(container);
		const elementsAfter = container.querySelectorAll("[data-fancybox][data-src]").length;

		console.log(`[BlackHaus Gallery] Processados ${elementsBefore} elementos, ${elementsAfter} com data-src`);
		return elementsBefore;
	}

	/**
	 * Destrói a instância da galeria
	 */
	destroy() {
		this.clearElementsCache();
		this.dynamicElementsAnimated = false;
		this.isOpeningWithAnimation = false;
		this.isClosingWithAnimation = false;
		this.currentFancyboxInstance = null;
		// Remove event listeners se necessário
		// Fancybox.destroy() se disponível
	}
}

// Inicializar a galeria quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
	window.blackHausGallery = new BlackHausGallery();
});

// Adiciona/remove classe ao clicar em elementos com data-thumbs-action
document.addEventListener("click", (e) => {
	const thumbsAction = e.target.closest("[data-thumbs-action]");
	if (thumbsAction) {
		thumbsAction.classList.toggle("is-active");
	}
});
