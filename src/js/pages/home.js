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
