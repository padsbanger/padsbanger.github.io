document.documentElement.classList.add("js");

// ===== Theme toggle: switch + persist light/dark, sync the address-bar color. =====
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#14150f" : "#e7e3d6");
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  };
  // The inline head script already set the initial theme; just sync the button state.
  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* storage may be unavailable (private mode); toggle still works for the session. */
    }
    applyTheme(next);
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// ===== Boot sequence: type a fake system log, then reveal the page. =====
const boot = document.getElementById("boot");
const bootLog = document.getElementById("boot-log");

const dismissBoot = () => {
  if (!boot || boot.classList.contains("done")) return;
  // Release the hero reveals so they animate in as the overlay clears.
  document.documentElement.classList.remove("is-booting");
  boot.classList.add("done");
  window.setTimeout(() => boot.remove(), 600);
};

if (boot && bootLog) {
  // Hold the reveal animations behind the boot overlay until it dismisses.
  if (!reduceMotion) {
    document.documentElement.classList.add("is-booting");
  }

  const stamp = (s) => {
    const t = new Date(Date.now() + s * 1000);
    return `[${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(
      t.getSeconds()
    ).padStart(2, "0")}]`;
  };

  const lines = [
    `${stamp(0)} <b>init</b> michal-lach.system`,
    `${stamp(0)} loading experience.modules ........ <i>06 ok</i>`,
    `${stamp(1)} mounting frontend/runtime ......... <i>ready</i>`,
    `${stamp(1)} resolving stack [react · typescript · next] <i>ok</i>`,
    `${stamp(2)} field operation ................... <i>active</i>`,
    `${stamp(2)} sys.online — <i>welcome</i>`,
  ];

  if (reduceMotion) {
    bootLog.innerHTML = lines.join("\n");
    dismissBoot();
  } else {
    let line = 0;
    let char = 0;
    let html = "";

    const tick = () => {
      const raw = lines[line];
      // Walk past whole HTML tags so we don't type "<b>" character by character.
      if (raw[char] === "<") {
        const close = raw.indexOf(">", char);
        char = close === -1 ? raw.length : close + 1;
      } else {
        char += 1;
      }

      bootLog.innerHTML = html + raw.slice(0, char);

      if (char >= raw.length) {
        html += raw + "\n";
        line += 1;
        char = 0;
        if (line >= lines.length) {
          window.setTimeout(dismissBoot, 320);
          return;
        }
        window.setTimeout(tick, 70);
      } else {
        window.setTimeout(tick, 4 + Math.floor(Math.random() * 7));
      }
    };

    window.setTimeout(tick, 120);
  }

  window.addEventListener("keydown", dismissBoot, { once: true });
  boot.addEventListener("click", dismissBoot);
}

// ===== Section-title scramble on scroll-in. =====
if (!reduceMotion && "IntersectionObserver" in window) {
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>#*";
  const titles = document.querySelectorAll(".section-title");

  const scramble = (el) => {
    const target = el.textContent;
    el.classList.add("is-scrambling");
    let frame = 0;
    const total = Math.max(18, target.length + 8);

    const step = () => {
      const progress = frame / total;
      const settled = Math.floor(progress * target.length);
      let out = "";
      for (let i = 0; i < target.length; i += 1) {
        const ch = target[i];
        if (ch === " " || i < settled) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      frame += 1;
      if (frame <= total) {
        window.setTimeout(step, 28);
      } else {
        el.textContent = target;
        el.classList.remove("is-scrambling");
      }
    };
    step();
  };

  const titleIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scramble(entry.target);
          titleIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  titles.forEach((el) => titleIo.observe(el));
}

// ===== Cursor spotlight: brighten the grid around the pointer. =====
const spotlight = document.getElementById("spotlight");
if (spotlight && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  let raf = 0;
  let mx = 0;
  let my = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) {
        raf = window.requestAnimationFrame(() => {
          spotlight.style.setProperty("--mx", `${mx}px`);
          spotlight.style.setProperty("--my", `${my}px`);
          spotlight.classList.add("on");
          raf = 0;
        });
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => spotlight.classList.remove("on"));
}

// ===== Magnetic buttons: gentle pull toward the cursor. =====
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  const STRENGTH = 0.1;
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

// ===== Live "system clock" in the footer (local CET). =====
const clock = document.getElementById("sys-clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Warsaw",
  });
  const tickClock = () => {
    clock.textContent = fmt.format(new Date());
  };
  tickClock();
  window.setInterval(tickClock, 1000);
}

// ===== Hero HUD readout: live UTC clock + date, brasshands-style. =====
const hudClock = document.getElementById("hud-clock");
const hudDate = document.getElementById("hud-date");
if (hudClock || hudDate) {
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  const tickHud = () => {
    const now = new Date();
    if (hudClock) hudClock.textContent = timeFmt.format(now);
    if (hudDate) hudDate.textContent = dateFmt.format(now).toUpperCase();
  };
  tickHud();
  window.setInterval(tickHud, 1000);
}

// ===== Contact email: copy to clipboard with inline confirmation. =====
const copyEmailLink = document.querySelector("[data-copy-email]");
if (copyEmailLink) {
  const email = copyEmailLink.dataset.copyEmail;
  const label = copyEmailLink.textContent.trim();
  let resetTimer = 0;

  copyEmailLink.addEventListener("click", async (event) => {
    if (!email || !navigator.clipboard?.writeText) return;

    event.preventDefault();

    try {
      await navigator.clipboard.writeText(email);
      window.clearTimeout(resetTimer);
      copyEmailLink.textContent = "copied ✓";
      copyEmailLink.setAttribute("aria-label", `${email} copied to clipboard`);
      copyEmailLink.classList.add("is-copied");

      resetTimer = window.setTimeout(() => {
        copyEmailLink.textContent = label;
        copyEmailLink.setAttribute("aria-label", `Copy email address ${email}`);
        copyEmailLink.classList.remove("is-copied");
      }, 1800);
    } catch (error) {
      window.location.href = copyEmailLink.href;
    }
  });
}
