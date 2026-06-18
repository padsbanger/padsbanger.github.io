type Theme = "dark" | "light";

const hasStoredTheme = () => {
  try {
    return localStorage.getItem("theme") !== null;
  } catch (error) {
    /* Storage can be unavailable (private mode); treat as no explicit choice. */
    return false;
  }
};

export const initThemeToggle = () => {
  const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement | null;
  if (!themeToggle) return;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#14150f" : "#e7e3d6");
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  };

  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch (error) {
      /* Storage can be unavailable; the theme still changes for this session. */
    }
    applyTheme(next);
  });

  // Follow the OS theme while the user hasn't made an explicit choice. Once they
  // toggle, the stored preference wins and we stop syncing to the system.
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  systemDark.addEventListener("change", (event) => {
    if (hasStoredTheme()) return;
    applyTheme(event.matches ? "dark" : "light");
  });
};
