const hero = document.querySelector(".project-hero");
const heroContent = document.querySelector(".project-hero_content");
const heroOverlay = document.querySelector(".project-hero_overlay");

let lastScrollY = 0;

// Função para verificar o scroll e executar o fade-out/in
function handleScroll() {
	const currentScrollY = window.scrollY;

	// Quando estiver no topo e vier de uma posição maior
	if (currentScrollY === 0 && lastScrollY > 0) {
		hero.classList.remove("cursor-zoom");
		gsap.to([heroContent, heroOverlay], {
			opacity: 1,
			duration: 0.3,
			ease: "power2.out",
		});
	}
	// Quando rolar para baixo e estiver no topo
	else if (currentScrollY > 0 && lastScrollY === 0) {
		gsap.to([heroContent, heroOverlay], {
			opacity: 0,
			duration: 0.4,
			ease: "power2.in",
			onComplete: () => {
				hero.classList.add("cursor-zoom");
			},
		});
	}

	lastScrollY = currentScrollY;
}

// Event listener para o scroll
window.addEventListener("scroll", handleScroll);
