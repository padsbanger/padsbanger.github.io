const formatStamp = (secondsOffset: number) => {
  const time = new Date(Date.now() + secondsOffset * 1000);
  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");

  return `[${hours}:${minutes}:${seconds}]`;
};

const bootLines = () => [
  `${formatStamp(0)} <b>init</b> michal-lach.system`,
  `${formatStamp(0)} loading experience.modules ........ <i>06 ok</i>`,
  `${formatStamp(1)} mounting frontend/runtime ......... <i>ready</i>`,
  `${formatStamp(1)} resolving stack [react \u00b7 typescript \u00b7 next] <i>ok</i>`,
  `${formatStamp(2)} field operation ................... <i>active</i>`,
  `${formatStamp(2)} sys.online \u2014 <i>welcome</i>`,
];

export const initBoot = (reduceMotion: boolean) => {
  const boot = document.getElementById("boot");
  const bootLog = document.getElementById("boot-log");
  if (!boot || !bootLog) return;

  const dismissBoot = () => {
    if (boot.classList.contains("done")) return;

    document.documentElement.classList.remove("is-booting");
    boot.classList.add("done");
    window.setTimeout(() => boot.remove(), 600);
  };

  if (!reduceMotion) {
    document.documentElement.classList.add("is-booting");
  }

  const lines = bootLines();
  if (reduceMotion) {
    bootLog.innerHTML = lines.join("\n");
    dismissBoot();
  } else {
    let line = 0;
    let character = 0;
    let html = "";

    const tick = () => {
      const raw = lines[line];
      if (raw[character] === "<") {
        const close = raw.indexOf(">", character);
        character = close === -1 ? raw.length : close + 1;
      } else {
        character += 1;
      }

      bootLog.innerHTML = html + raw.slice(0, character);

      if (character >= raw.length) {
        html += `${raw}\n`;
        line += 1;
        character = 0;

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
};
