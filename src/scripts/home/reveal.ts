const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>#*";

export const initReveal = () => {
  const elements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return;
  }

  elements.forEach((element) => element.classList.add("in"));
};

export const initTitleScramble = (reduceMotion: boolean) => {
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const titles = document.querySelectorAll<HTMLElement>(".section-title");
  const scramble = (element: HTMLElement) => {
    const target = element.textContent ?? "";
    element.classList.add("is-scrambling");

    let frame = 0;
    const total = Math.max(18, target.length + 8);

    const step = () => {
      const progress = frame / total;
      const settled = Math.floor(progress * target.length);
      let output = "";

      for (let index = 0; index < target.length; index += 1) {
        const character = target[index];
        output += character === " " || index < settled
          ? character
          : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
      }

      element.textContent = output;
      frame += 1;

      if (frame <= total) {
        window.setTimeout(step, 28);
      } else {
        element.textContent = target;
        element.classList.remove("is-scrambling");
      }
    };

    step();
  };

  const titleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target instanceof HTMLElement) {
            scramble(entry.target);
          }
          titleObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  titles.forEach((element) => titleObserver.observe(element));
};
