// LENIS
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis({
	anchors: true,
	lerp: 0.1,
	gestureOrientation: "vertical",
});

// Configuração para seções com rolagem mais lenta
const slowScrollSections = [
	//".section_intro", // substitua pelos seletores das suas seções
	".section_about",
];

// Função para verificar se o usuário está em uma seção de rolagem lenta
function isInSlowScrollSection() {
	const scrollY = window.scrollY;
	const windowHeight = window.innerHeight;
	const currentViewportCenter = scrollY + windowHeight / 2;

	for (let selector of slowScrollSections) {
		const section = document.querySelector(selector);
		if (section) {
			const rect = section.getBoundingClientRect();
			const sectionTop = scrollY + rect.top;
			const sectionBottom = sectionTop + rect.height;

			// Verifica se o centro da viewport está dentro da seção
			if (currentViewportCenter >= sectionTop && currentViewportCenter <= sectionBottom) {
				return true;
			}
		}
	}
	return false;
}

// Modifica a velocidade da rolagem baseada na seção atual
lenis.on("virtual-scroll", (e) => {
	if (isInSlowScrollSection()) {
		e.deltaY *= 0.3;
		e.deltaX *= 0.3;
	}
});

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on("scroll", ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
	lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

// =================================================================

// Disables RC on Images
$("img").bind("contextmenu", function (e) {
	return false;
});
// Disables RC on Lightboxes
$(document).on("contextmenu", "img", function () {
	return false;
});

// PAGE TRANSITION
gsap.to(".transition", {
	backgroundColor: "#E3DFD6",
	opacity: 0,
	duration: 0.8,
	onComplete: () => {
		gsap.set(".transition", {
			display: "none",
			backgroundColor: "transparent",
		});
	},
});

$(document).ready(function () {
	$("a").on("click", function (e) {
		if ($(this).prop("hostname") === window.location.host && $(this).attr("href").indexOf("#") === -1 && $(this).attr("target") !== "_blank") {
			e.preventDefault();
			let destination = $(this).attr("href");
			gsap.set(".transition", {
				display: "block",
			});
			gsap.fromTo(
				".transition",
				{
					backgroundColor: "transparent",
					opacity: 0,
				},
				{
					backgroundColor: "#E3DFD6",
					opacity: 1,
					duration: 0.8,
					onComplete: () => {
						window.location = destination;
					},
				}
			);
		}
	});
});
