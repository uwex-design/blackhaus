class Gallery {
	constructor() {
		this.lightbox = document.getElementById("lightbox");
		this.backdrop = this.lightbox.querySelector(".lightbox-backdrop");
		this.image = this.lightbox.querySelector(".lightbox-image");
		this.closeBtn = this.lightbox.querySelector(".lightbox-close");
		this.prevBtn = this.lightbox.querySelector(".lightbox-prev");
		this.nextBtn = this.lightbox.querySelector(".lightbox-next");
		this.counter = this.lightbox.querySelector(".lightbox-counter");
		this.currentSpan = this.counter.querySelector(".current");
		this.totalSpan = this.counter.querySelector(".total");

		this.currentGallery = [];
		this.currentIndex = 0;
		this.isOpen = false;

		this.init();
	}

	init() {
		this.bindEvents();
		this.setupGalleryItems();
	}

	bindEvents() {
		// Fechar lightbox
		this.closeBtn.addEventListener("click", () => this.closeLightbox());
		this.backdrop.addEventListener("click", () => this.closeLightbox());

		// Navegação
		this.prevBtn.addEventListener("click", () => this.prevImage());
		this.nextBtn.addEventListener("click", () => this.nextImage());

		// Navegação por teclado
		document.addEventListener("keydown", (e) => {
			if (!this.isOpen) return;

			switch (e.key) {
				case "Escape":
					this.closeLightbox();
					break;
				case "ArrowLeft":
					this.prevImage();
					break;
				case "ArrowRight":
					this.nextImage();
					break;
			}
		});
	}

	setupGalleryItems() {
		const galleryItems = document.querySelectorAll(".gallery-grid_item");

		galleryItems.forEach((item) => {
			item.addEventListener("click", (e) => {
				e.preventDefault();
				this.openLightbox(item);
			});
		});
	}

	openLightbox(clickedItem) {
		if (this.isOpen) return;

		const galleryName = clickedItem.getAttribute("gallery-name");
		const img = clickedItem.querySelector("img");

		// Coletar todas as imagens da mesma galeria
		this.currentGallery = this.getGalleryImages(galleryName);
		this.currentIndex = this.currentGallery.findIndex((item) => item === clickedItem);

		// Mostrar lightbox
		this.lightbox.classList.add("active");
		this.isOpen = true;

		// Definir imagem atual
		this.setCurrentImage(img.src, img.alt);
		this.updateCounter();

		// Animações de abertura
		this.animateOpen();
	}

	animateOpen() {
		const tl = gsap.timeline();

		// 1. Animação do backdrop de baixo para cima
		tl.fromTo(
			this.backdrop,
			{
				y: "100%",
			},
			{
				y: "0%",
				duration: 0.8,
				ease: "power2.out",
			}
		);

		// 2. Animação da imagem de cima para baixo com máscara
		tl.fromTo(
			this.image,
			{
				y: "-100%",
			},
			{
				y: "0%",
				duration: 1,
				ease: "power2.out",
			},
			"-=0.2"
		);

		// Fade in dos botões
		tl.fromTo(
			[this.closeBtn, this.prevBtn, this.nextBtn, this.counter],
			{
				opacity: 0,
			},
			{
				opacity: 1,
				duration: 0.6,
			},
			"-=0.3"
		);
	}

	closeLightbox() {
		if (!this.isOpen) return;

		const tl = gsap.timeline({
			onComplete: () => {
				this.lightbox.classList.remove("active");
				this.isOpen = false;
			},
		});

		// Fade out dos botões
		tl.to([this.closeBtn, this.prevBtn, this.nextBtn, this.counter], {
			opacity: 0,
			duration: 0.4,
		});

		// Animação da imagem para cima
		tl.to(
			this.image,
			{
				y: "-100%",
				duration: 0.6,
				ease: "power2.in",
			},
			"-=0.1"
		);

		// Animação do backdrop para baixo
		tl.to(
			this.backdrop,
			{
				y: "100%",
				duration: 0.8,
				ease: "power2.in",
			},
			"-=0.2"
		);
	}

	prevImage() {
		if (this.currentGallery.length <= 1) return;

		this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.currentGallery.length - 1;

		this.changeImage("prev");
	}

	nextImage() {
		if (this.currentGallery.length <= 1) return;

		this.currentIndex = this.currentIndex < this.currentGallery.length - 1 ? this.currentIndex + 1 : 0;

		this.changeImage("next");
	}

	changeImage(direction = "next") {
		const currentItem = this.currentGallery[this.currentIndex];
		const img = currentItem.querySelector("img");

		// Animação de troca de imagem com direção
		if (direction === "prev") {
			// Voltando: foto atual sai para baixo ↓
			gsap.to(this.image, {
				opacity: "0",
				duration: 0.8,
				ease: "power2.in",
				onComplete: () => {
					// Trocar imagem e resetar posição
					this.setCurrentImage(img.src, img.alt);
					this.updateCounter();

					// Colocar a nova imagem na posição inicial (embaixo)
					gsap.set(this.image, { opacity: "0" });

					// Animar a nova foto subindo de baixo ↑
					gsap.to(this.image, {
						opacity: "100%",
						duration: 1,
						ease: "power2.out",
					});
				},
			});
		} else {
			// Avançando: foto atual sai para cima ↑
			gsap.to(this.image, {
				opacity: "0",
				duration: 0.8,
				ease: "power2.in",
				onComplete: () => {
					// Trocar imagem e resetar posição
					this.setCurrentImage(img.src, img.alt);
					this.updateCounter();

					// Colocar a nova imagem na posição inicial (em cima)
					gsap.set(this.image, { opacity: "0" });

					// Animar a nova foto descendo de cima ↓
					gsap.to(this.image, {
						opacity: "100%",
						duration: 1,
						ease: "power2.out",
					});
				},
			});
		}
	}

	setCurrentImage(src, alt) {
		this.image.src = src;
		this.image.alt = alt;
	}

	updateCounter() {
		this.currentSpan.textContent = this.currentIndex + 1;
		this.totalSpan.textContent = this.currentGallery.length;

		// Mostrar/esconder botões de navegação
		if (this.currentGallery.length <= 1) {
			this.prevBtn.style.display = "none";
			this.nextBtn.style.display = "none";
		} else {
			this.prevBtn.style.display = "block";
			this.nextBtn.style.display = "block";
		}
	}

	getGalleryImages(galleryName) {
		return Array.from(document.querySelectorAll(`[gallery-name="${galleryName}"]`));
	}
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
	new Gallery();
});
