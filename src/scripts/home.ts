import { initActiveNav } from "./home/active-nav";
import { initBoot } from "./home/boot";
import { initCopyEmail } from "./home/contact";
import { initFooterClock, initFooterEasterEgg, initHeroHud } from "./home/footer";
import { initMagneticButtons, initSpotlight } from "./home/interactions";
import { reduceMotion } from "./home/motion";
import { initReveal, initTitleScramble } from "./home/reveal";
import { initScrollHud } from "./home/scroll-hud";
import { initThemeToggle } from "./home/theme";

document.documentElement.classList.add("js");

initThemeToggle();
initReveal();
initScrollHud();
initActiveNav();
initBoot(reduceMotion);
initTitleScramble(reduceMotion);
initSpotlight(reduceMotion);
initMagneticButtons(reduceMotion);
initFooterClock();
initFooterEasterEgg();
initHeroHud();
initCopyEmail();
