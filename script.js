const THEME_STORAGE_KEY = "theme";
const root = document.documentElement;
const themeToggleButton = document.querySelector(".theme-toggle");
const yearElement = document.getElementById("year");

const normalizeTheme = (theme) => (theme === "light" ? "light" : "dark");

const safeGetStoredTheme = () => {
	try {
		return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
	} catch (error) {
		return "dark";
	}
};

const updateToggleA11yState = (theme) => {
	if (!themeToggleButton) {
		return;
	}

	const isLightTheme = theme === "light";
	themeToggleButton.setAttribute("aria-pressed", String(isLightTheme));
	themeToggleButton.setAttribute(
		"aria-label",
		isLightTheme ? "Switch to dark theme" : "Switch to light theme"
	);
};

const applyTheme = (theme, { persist = false } = {}) => {
	const normalizedTheme = normalizeTheme(theme);
	root.setAttribute("data-theme", normalizedTheme);
	root.style.colorScheme = normalizedTheme;
	updateToggleA11yState(normalizedTheme);

	if (persist) {
		try {
			localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
		} catch (error) {
			// Ignore storage errors so the UI remains functional.
		}
	}
};

const initialTheme = normalizeTheme(root.getAttribute("data-theme") || safeGetStoredTheme());
applyTheme(initialTheme);

if (themeToggleButton) {
	themeToggleButton.addEventListener("click", () => {
		const currentTheme = normalizeTheme(root.getAttribute("data-theme"));
		const nextTheme = currentTheme === "dark" ? "light" : "dark";
		applyTheme(nextTheme, { persist: true });
	});
}

window.requestAnimationFrame(() => {
	root.classList.add("theme-ready");
});

if (yearElement) {
	yearElement.textContent = String(new Date().getFullYear());
}

const navContainer = document.querySelector(".nav");
const navToggleButton = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("primary-nav");

if (navContainer && navToggleButton && navMenu) {
	const setNavOpen = (isOpen) => {
		navContainer.classList.toggle("is-open", isOpen);
		navToggleButton.setAttribute("aria-expanded", String(isOpen));
		navToggleButton.setAttribute(
			"aria-label",
			isOpen ? "Close navigation menu" : "Open navigation menu"
		);
	};

	navToggleButton.addEventListener("click", () => {
		const isOpen = navContainer.classList.contains("is-open");
		setNavOpen(!isOpen);
	});

	navMenu.addEventListener("click", (event) => {
		if (event.target.closest("a")) {
			setNavOpen(false);
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && navContainer.classList.contains("is-open")) {
			setNavOpen(false);
			navToggleButton.focus();
		}
	});
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealSections = document.querySelectorAll(".reveal");

revealSections.forEach((section) => {
	section.classList.add("reveal-target");
});

if (!prefersReducedMotion && "IntersectionObserver" in window) {
	const sectionObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}

				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		},
		{
			threshold: 0.16,
			rootMargin: "0px 0px -8% 0px"
		}
	);

	revealSections.forEach((section) => {
		sectionObserver.observe(section);
	});
} else {
	revealSections.forEach((section) => {
		section.classList.add("is-visible");
	});
}
