$(document).ready(function () {
	initFooterLogoAnimation();
});

// LOGO FOOTER ANIMATION
function initFooterLogoAnimation() {
	const $letters = $(".footer_logo .letter-group");
	if (!$letters.length) return;

	gsap.set($letters, { opacity: 0 });

	gsap
		.timeline({
			scrollTrigger: {
				trigger: ".footer_logo",
				start: "top 80%",
				end: "bottom 20%",
				toggleActions: "play none none reverse",
			},
		})
		.to(gsap.utils.shuffle($letters.toArray()), {
			opacity: 1,
			duration: 1.5,
			stagger: 0.1,
			ease: "power2.out",
		});
}

/**
 * Hero Video Optimizer - Versão Adaptada para Webflow
 * Implementação otimizada para funcionar perfeitamente no Webflow
 * sem conflitos com o sistema de publicação
 */

(function () {
	"use strict";

	class WebflowHeroVideoOptimizer {
		constructor(containerSelector = "[data-hero-video]") {
			this.containers = document.querySelectorAll(containerSelector);
			this.instances = [];

			if (this.containers.length === 0) {
				console.warn("Nenhum container [data-hero-video] encontrado");
				return;
			}

			this.init();
		}

		init() {
			this.containers.forEach((container, index) => {
				console.log(`Inicializando hero video ${index + 1}`);
				const instance = new HeroVideoInstance(container);
				this.instances.push(instance);
			});
		}

		// Método público para destruir todas as instâncias
		destroy() {
			this.instances.forEach((instance) => instance.destroy());
			this.instances = [];
		}
	}

	class HeroVideoInstance {
		constructor(container) {
			this.container = container;
			this.video = container.querySelector("video");

			if (!this.video) {
				console.error("Elemento video não encontrado no container");
				return;
			}

			// Configurações
			this.isMobile = window.innerWidth < 768;
			this.connection = this.getConnectionInfo();
			this.isLoaded = false;
			this.isPlaying = false;
			this.intersectionObserver = null;

			// URLs dos vídeos - configuráveis via data attributes
			this.videoUrls = this.getVideoUrls();

			this.init();
		}

		async init() {
			// 1. Setup inicial
			this.setupVideoElement();

			// 2. Verificar se deve carregar
			const shouldLoad = await this.shouldLoadVideo();

			if (!shouldLoad) {
				console.log("Mostrando fallback estático devido à conexão");
				this.showStaticFallback();
				return;
			}

			// 3. Setup dos componentes
			this.setupAdaptiveLoader();
			this.setupIntersectionObserver();
			this.setupEventListeners();

			console.log("Hero video inicializado com sucesso");
		}

		getVideoUrls() {
			const container = this.container;
			return {
				high: {
					webm: container.dataset.videoHighWebm || "",
					mp4: container.dataset.videoHighMp4 || "",
				},
				medium: {
					webm: container.dataset.videoMediumWebm || "",
					mp4: container.dataset.videoMediumMp4 || "",
				},
				low: {
					webm: container.dataset.videoLowWebm || "",
					mp4: container.dataset.videoLowMp4 || "",
				},
			};
		}

		setupVideoElement() {
			// Configurar aspect ratio para evitar layout shift
			const aspectRatio = this.container.dataset.aspectRatio || "16/9";
			this.video.style.aspectRatio = aspectRatio;
			this.video.style.objectFit = "cover";
			this.video.style.width = "100%";
			this.video.style.height = "100%";

			// Configurar para lazy loading
			this.video.preload = "none";
			this.video.muted = true; // Necessário para autoplay

			// Remover src para lazy loading
			this.originalSrc = this.video.src;
			this.video.removeAttribute("src");

			const sources = this.video.querySelectorAll("source");
			sources.forEach((source) => {
				source.originalSrc = source.src;
				source.removeAttribute("src");
			});
		}

		getConnectionInfo() {
			if ("connection" in navigator && navigator.connection) {
				const conn = navigator.connection;
				return {
					effectiveType: conn.effectiveType || "4g",
					downlink: conn.downlink || 10,
					saveData: conn.saveData || false,
				};
			}
			return { effectiveType: "4g", downlink: 10, saveData: false };
		}

		async shouldLoadVideo() {
			// Respeitar economia de dados
			if (this.connection.saveData) return false;

			// Conexões muito lentas
			if (["slow-2g", "2g"].includes(this.connection.effectiveType)) {
				return false;
			}

			// 3G com downlink baixo
			if (this.connection.effectiveType === "3g" && this.connection.downlink < 1.5) {
				return false;
			}

			// Mobile com conexão desconhecida - teste de velocidade
			if (this.isMobile && !this.connection.downlink) {
				return await this.testConnectionSpeed();
			}

			return true;
		}

		async testConnectionSpeed() {
			// Usar uma imagem pequena do próprio Webflow para teste
			const testUrl = this.video.poster + "?w=100&q=50"; // Poster reduzido
			const startTime = performance.now();

			try {
				await fetch(testUrl, {
					cache: "no-cache",
					signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
				});

				const duration = performance.now() - startTime;
				return duration < 1000; // Conexão ok se < 1 segundo
			} catch {
				return false;
			}
		}

		setupAdaptiveLoader() {
			const strategy = this.determineStrategy();
			console.log("Estratégia escolhida:", strategy);
			this.applyStrategy(strategy);
		}

		determineStrategy() {
			const conn = this.connection;

			if (conn.effectiveType === "4g" && conn.downlink > 5) {
				return "high";
			} else if (conn.effectiveType === "4g" || conn.downlink > 3) {
				return "medium";
			} else if (conn.downlink > 1.5) {
				return "low";
			}

			return "medium"; // Fallback
		}

		applyStrategy(strategy) {
			const urls = this.videoUrls[strategy];

			if (!urls.mp4 && !urls.webm) {
				// Usar URLs originais se não configuradas
				this.video.src = this.originalSrc;
				const sources = this.video.querySelectorAll("source");
				sources.forEach((source) => {
					source.src = source.originalSrc;
				});
				return;
			}

			// Aplicar URLs da estratégia
			const sources = this.video.querySelectorAll("source");
			sources.forEach((source) => {
				if (source.type.includes("webm") && urls.webm) {
					source.dataset.src = urls.webm;
				} else if (source.type.includes("mp4") && urls.mp4) {
					source.dataset.src = urls.mp4;
				}
			});
		}

		setupIntersectionObserver() {
			if (!window.IntersectionObserver) {
				// Fallback para navegadores antigos
				setTimeout(() => this.loadAndPlayVideo(), 1000);
				return;
			}

			const options = {
				threshold: [0, 0.25, 0.5],
				rootMargin: "50px 0px",
			};

			this.intersectionObserver = new IntersectionObserver((entries) => {
				entries.forEach((entry) => this.handleIntersection(entry));
			}, options);

			this.intersectionObserver.observe(this.video);
		}

		async handleIntersection(entry) {
			const ratio = entry.intersectionRatio;

			if (ratio >= 0.25 && !this.isLoaded) {
				console.log("Carregando vídeo...");
				await this.loadVideo();
			}

			if (ratio >= 0.5 && this.isLoaded && !this.isPlaying) {
				console.log("Iniciando reprodução...");
				this.playVideo();
			}

			if (ratio < 0.1 && this.isPlaying) {
				this.pauseVideo();
			}
		}

		async loadVideo() {
			if (this.isLoaded) return;

			// Carregar sources
			const sources = this.video.querySelectorAll("source[data-src]");
			sources.forEach((source) => {
				source.src = source.dataset.src;
				delete source.dataset.src;
			});

			this.video.load();
			this.isLoaded = true;

			return new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error("Timeout carregando vídeo"));
				}, 10000);

				const cleanup = () => clearTimeout(timeout);

				this.video.addEventListener(
					"loadedmetadata",
					() => {
						cleanup();
						resolve();
					},
					{ once: true }
				);

				this.video.addEventListener(
					"error",
					() => {
						cleanup();
						this.handleVideoError();
						reject();
					},
					{ once: true }
				);
			});
		}

		async playVideo() {
			if (this.isPlaying || !this.isLoaded) return;

			try {
				await this.video.play();
				this.isPlaying = true;
				console.log("Vídeo reproduzindo");
			} catch (error) {
				console.warn("Autoplay bloqueado:", error);
				if (error.name === "NotAllowedError") {
					this.showPlayButton();
				}
			}
		}

		pauseVideo() {
			if (!this.isPlaying) return;
			this.video.pause();
			this.isPlaying = false;
		}

		setupEventListeners() {
			this.video.addEventListener("error", () => this.handleVideoError());

			// Resize handling
			const resizeHandler = this.debounce(() => {
				this.isMobile = window.innerWidth < 768;
			}, 250);

			window.addEventListener("resize", resizeHandler);
		}

		handleVideoError() {
			console.error("Erro no vídeo - mostrando fallback");
			this.showStaticFallback();
		}

		showPlayButton() {
			const existingBtn = this.container.querySelector(".hero-play-btn");
			if (existingBtn) return;

			const playBtn = document.createElement("div");
			playBtn.className = "hero-play-btn";
			playBtn.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 25px solid #333;
            border-top: 15px solid transparent;
            border-bottom: 15px solid transparent;
            margin-left: 5px;
          "></div>
        </div>
      `;

			playBtn.addEventListener("click", async () => {
				try {
					await this.video.play();
					this.isPlaying = true;
					playBtn.remove();
				} catch (e) {
					this.handleVideoError();
				}
			});

			this.container.appendChild(playBtn);
		}

		showStaticFallback() {
			if (this.container.querySelector(".hero-fallback")) return;

			const fallback = document.createElement("div");
			fallback.className = "hero-fallback";
			fallback.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('${this.video.poster}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: 1;
      `;

			this.container.appendChild(fallback);
			this.video.style.display = "none";
		}

		debounce(func, wait) {
			let timeout;
			return function executedFunction(...args) {
				const later = () => {
					clearTimeout(timeout);
					func(...args);
				};
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
			};
		}

		destroy() {
			if (this.intersectionObserver) {
				this.intersectionObserver.disconnect();
			}
			this.pauseVideo();
		}
	}

	// Inicialização automática
	function initHeroVideos() {
		// Aguardar Webflow carregar completamente
		if (window.Webflow && window.Webflow.ready) {
			window.Webflow.ready(() => {
				new WebflowHeroVideoOptimizer();
			});
		} else {
			// Fallback se Webflow não estiver disponível
			document.addEventListener("DOMContentLoaded", () => {
				new WebflowHeroVideoOptimizer();
			});
		}
	}

	// Executar inicialização
	initHeroVideos();

	// Disponibilizar globalmente para controle manual se necessário
	window.WebflowHeroVideoOptimizer = WebflowHeroVideoOptimizer;
})();
