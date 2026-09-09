document.addEventListener("DOMContentLoaded", () => {
	const menuButton = document.querySelector(".nav-toggle");
	const mobileNav = document.getElementById("mobileNav");

	menuButton.addEventListener("click", () => {
		const isOpen = mobileNav.classList.toggle("open");
		menuButton.setAttribute("aria-expanded", isOpen);
	});
	mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
		mobileNav.classList.remove("open");
		menuButton.setAttribute("aria-expanded", "false");
	}));
	const sections = document.querySelectorAll("#facilities, #experience, #contact");
	const navLinks = document.querySelectorAll(".main-nav a");
	const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
		if (entry.isIntersecting) navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
	}), { rootMargin: "-35% 0px -55%" });
	sections.forEach((section) => observer.observe(section));

	let runs = 0;
	let wickets = 0;
	let balls = 0;
	let targetRate = 8;
	const runsDisplay = document.getElementById("runsDisplay");
	const wicketsDisplay = document.getElementById("wicketsDisplay");
	const oversDisplay = document.getElementById("oversDisplay");
	const runRateDisplay = document.getElementById("runRateDisplay");
	const targetDisplay = document.getElementById("targetDisplay");
	const targetOutput = document.getElementById("targetRateOutput");
	const labNote = document.getElementById("labNote");

	function updateScoreboard() {
		runsDisplay.textContent = runs;
		wicketsDisplay.textContent = wickets;
		oversDisplay.textContent = `${Math.floor(balls / 6)}.${balls % 6}`;
		runRateDisplay.textContent = balls ? (runs / (balls / 6)).toFixed(2) : "0.00";
		targetDisplay.textContent = targetRate.toFixed(1);
		targetOutput.value = targetRate.toFixed(1);
		document.querySelectorAll("#overDots i").forEach((dot, index) => dot.classList.toggle("active", index < balls % 6 || (balls > 0 && balls % 6 === 0)));
	}

	document.querySelectorAll("[data-run]").forEach((button) => button.addEventListener("click", () => {
		runs += Number(button.dataset.run);
		balls += 1;
		labNote.textContent = `Nice shot. ${runs} runs from ${balls} ball${balls === 1 ? "" : "s"}.`;
		updateScoreboard();
	}));
	document.querySelector("[data-wicket]").addEventListener("click", () => {
		if (wickets < 10) wickets += 1;
		balls += 1;
		labNote.textContent = "Wicket! Reset your stance and keep the innings moving.";
		updateScoreboard();
	});
	document.getElementById("resetScore").addEventListener("click", () => {
		runs = 0; wickets = 0; balls = 0; labNote.textContent = "Tap the score controls to build an innings."; updateScoreboard();
	});
	document.getElementById("targetRate").addEventListener("input", (event) => { targetRate = Number(event.target.value); updateScoreboard(); });
	document.querySelectorAll(".mode-choice").forEach((button) => button.addEventListener("click", () => {
		document.querySelectorAll(".mode-choice").forEach((choice) => choice.classList.toggle("active", choice === button));
		document.getElementById("inningsMode").textContent = button.dataset.mode;
		labNote.textContent = button.dataset.mode === "BATTING" ? "Tap the score controls to build an innings." : "Track the pressure and defend your total.";
	}));
	updateScoreboard();
});
