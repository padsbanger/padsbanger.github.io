type NavTarget = {
  link: HTMLAnchorElement;
  target: HTMLElement;
};

export const initActiveNav = () => {
  const navTargets = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav a[href^="#"]'))
    .map((link) => {
      const target = link.hash ? document.querySelector<HTMLElement>(link.hash) : null;
      return target ? { link, target } : null;
    })
    .filter((item): item is NavTarget => item !== null);

  if (!navTargets.length || !("IntersectionObserver" in window)) return;

  const setActiveNav = (id: string) => {
    navTargets.forEach(({ link }) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const visibleSections = new Map<string, number>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target.id, entry.intersectionRatio);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      const activeId = Array.from(visibleSections.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (activeId) setActiveNav(activeId);
    },
    {
      rootMargin: "-28% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75],
    }
  );

  navTargets.forEach(({ target }) => observer.observe(target));
};
