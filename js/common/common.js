gsap.to(".transition", {
	backgroundColor: "white",
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
					backgroundColor: "white",
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

document.addEventListener("DOMContentLoaded", function () {
	// Inicializa rolagem suave com valores mais leves
	const lenis = new Lenis({
		autoRaf: true,
		lerp: 0.02, // Reduzido de 0.04 para uma transição mais suave
		wheelMultiplier: 0.4, // Reduzido de 0.6 para rolagem mais leve
		touchMultiplier: 0.6, // Reduzido de 0.8 para rolagem mais leve no touch
	});
});
