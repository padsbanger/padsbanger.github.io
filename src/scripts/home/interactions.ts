export const initSpotlight = (reduceMotion: boolean) => {
  const spotlight = document.getElementById("spotlight");
  if (!spotlight || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  let raf = 0;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!raf) {
        raf = window.requestAnimationFrame(() => {
          spotlight.style.setProperty("--mx", `${mouseX}px`);
          spotlight.style.setProperty("--my", `${mouseY}px`);
          spotlight.classList.add("on");
          raf = 0;
        });
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => spotlight.classList.remove("on"));
};

export const initMagneticButtons = (reduceMotion: boolean) => {
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  const strength = 0.1;
  document.querySelectorAll<HTMLElement>(".btn").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const deltaX = event.clientX - (rect.left + rect.width / 2);
      const deltaY = event.clientY - (rect.top + rect.height / 2);
      button.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
};
