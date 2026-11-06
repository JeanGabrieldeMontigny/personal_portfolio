// @ts-check

const root = document.documentElement;
const THEME_KEY = "theme";

/** @returns {"light" | "dark"} */
function currentTheme() {
  const set = root.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Theme toggle: remembers the choice, otherwise follows the system setting.
const themeToggle = /** @type {HTMLButtonElement | null} */ (document.querySelector("#theme-toggle"));

if (themeToggle) {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  } catch {
    // Storage can be blocked; the system setting still applies.
  }

  themeToggle.setAttribute("aria-pressed", String(currentTheme() === "dark"));

  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    themeToggle.setAttribute("aria-pressed", String(next === "dark"));
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Ignore: the choice just won't persist.
    }
  });
}

// Filter chips: show only the experience entries that match the chosen type.
const filterBar = document.querySelector("#filters");
const filterStatus = document.querySelector("#filter-status");
const entries = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll("[data-category]"));

if (filterBar && filterStatus) {
  const chips = /** @type {NodeListOf<HTMLButtonElement>} */ (filterBar.querySelectorAll("button[data-filter]"));
  filterBar.removeAttribute("hidden");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      let shown = 0;

      chips.forEach((other) => other.setAttribute("aria-pressed", String(other === chip)));

      entries.forEach((entry) => {
        const match = filter === "all" || entry.dataset.category === filter;
        entry.hidden = !match;
        if (match) shown += 1;
      });

      filterStatus.textContent = `Showing ${shown} of ${entries.length} entries.`;
    });
  });
}

// Copy email: only shown when the browser supports the clipboard.
const copyButton = /** @type {HTMLButtonElement | null} */ (document.querySelector("#copy-email"));
const emailLink = document.querySelector("#email-link");
const copyStatus = document.querySelector("#copy-status");

if (copyButton && emailLink && copyStatus && navigator.clipboard) {
  copyButton.hidden = false;

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(emailLink.textContent ?? "");
      copyStatus.textContent = "Email address copied.";
    } catch {
      copyStatus.textContent = "Copying failed. Select the address and copy it manually.";
    }
  });
}
