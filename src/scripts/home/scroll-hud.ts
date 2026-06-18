export const initScrollHud = () => {
  const header = document.querySelector<HTMLElement>(".site-header");
  const scrollProgressBar = document.getElementById("scroll-progress-bar");
  if (!header && !scrollProgressBar) return;

  let scrollRaf = 0;
  const updateScrollHud = () => {
    if (header) {
      header.style.boxShadow = window.scrollY > 8 ? "0 10px 0 rgba(0, 0, 0, 0.36)" : "none";
    }

    if (scrollProgressBar) {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      scrollProgressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
    }

    scrollRaf = 0;
  };

  const requestScrollHudUpdate = () => {
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(updateScrollHud);
  };

  window.addEventListener("scroll", requestScrollHudUpdate, { passive: true });
  window.addEventListener("resize", requestScrollHudUpdate, { passive: true });
  updateScrollHud();
};
