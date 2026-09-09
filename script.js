document.addEventListener("DOMContentLoaded", () => {
	const menuButton = document.querySelector(".nav-toggle");
	const mobileNav = document.getElementById("mobileNav");
	const dialog = document.getElementById("detailDialog");

	menuButton.addEventListener("click", () => {
		const isOpen = mobileNav.classList.toggle("open");
		menuButton.setAttribute("aria-expanded", isOpen);
	});
	mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
		mobileNav.classList.remove("open");
		menuButton.setAttribute("aria-expanded", "false");
	}));

	document.querySelectorAll(".card-open").forEach((button) => button.addEventListener("click", () => {
		const card = button.closest(".facility-card");
		document.getElementById("dialogImage").src = card.dataset.image;
		document.getElementById("dialogImage").alt = card.querySelector("img").alt;
		document.getElementById("dialogTitle").textContent = card.dataset.title;
		document.getElementById("dialogDescription").textContent = card.dataset.description;
		dialog.showModal();
	}));
	document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
	dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

	const sections = document.querySelectorAll("#facilities, #experience, #contact");
	const navLinks = document.querySelectorAll(".main-nav a");
	const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
		if (entry.isIntersecting) navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
	}), { rootMargin: "-35% 0px -55%" });
	sections.forEach((section) => observer.observe(section));
});
