// The marquee loops by translating the track -50% (one of two identical groups).
// That only reads as seamless when a single group is wider than the viewport;
// with short content a gap appears once the items pass. Pad each group with
// clones of its own items — equally, so the two halves stay identical — until a
// group spans at least the container width. Re-runs on resize to top up.
export const initMarquee = () => {
  const marquees = Array.from(document.querySelectorAll<HTMLElement>(".marquee"));
  if (!marquees.length) return;

  const fill = (marquee: HTMLElement) => {
    const groups = Array.from(marquee.querySelectorAll<HTMLElement>(".marquee-group"));
    if (!groups.length) return;

    const templates = groups.map((group) => group.innerHTML);
    const target = marquee.clientWidth;
    let guard = 0;

    while (groups[0].scrollWidth < target && guard < 24) {
      groups.forEach((group, i) => {
        group.insertAdjacentHTML("beforeend", templates[i]);
      });
      guard += 1;
    }
  };

  let resizeRaf = 0;
  const onResize = () => {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(() => {
      marquees.forEach(fill);
      resizeRaf = 0;
    });
  };

  marquees.forEach(fill);
  window.addEventListener("resize", onResize, { passive: true });
};
