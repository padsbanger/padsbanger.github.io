document.documentElement.classList.add("js");

// Scroll-reveal: fade & lift elements into view as they enter the viewport.
const els = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
} else {
  els.forEach((el) => el.classList.add("in"));
}

// Subtle header shadow once the page is scrolled.
const header = document.querySelector(".site-header");
const onScroll = () => {
  header.style.boxShadow = window.scrollY > 8 ? "0 10px 0 rgba(0, 0, 0, 0.36)" : "none";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
