// Adicionar classe ao nav quando rolar 50px
window.addEventListener("scroll", () => {
	const nav = document.querySelector(".nav_component");

	if (window.scrollY >= 50) {
		nav.classList.add("sticky");
	} else {
		nav.classList.remove("sticky");
	}
});

// NAVBAR COLOR CHANGE
const sections = document.querySelectorAll("[data-color]");
const navComponent = document.querySelector(".nav_component");

// Função para verificar qual seção está no topo do viewport
const checkSectionColor = () => {
	sections.forEach((section) => {
		const rect = section.getBoundingClientRect();
		// Verifica se a seção está no topo do viewport (com uma pequena margem de tolerância)
		if (rect.top <= 50 && rect.bottom >= 50) {
			const color = section.dataset.color;

			// Remove as classes existentes
			navComponent.classList.remove("light", "dark");
			// Adiciona a classe correspondente
			navComponent.classList.add(color);
		}
	});
};

// Adicionar listener para scroll
window.addEventListener("scroll", checkSectionColor);

// Executar verificação inicial
checkSectionColor();

// Animação fade-up para imagens de projeto
document.querySelectorAll(".gallery-item_link, .project-img").forEach((img) => {
	gsap.from(img, {
		y: 50,
		opacity: 0,
		duration: 1,
		ease: "power2.out",
		scrollTrigger: {
			trigger: img,
			start: "top 85%",
			toggleActions: "play none none reverse",
		},
	});
});
