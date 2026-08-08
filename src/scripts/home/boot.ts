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

  const shouldBoot = document.documentElement.classList.contains("is-booting") && !reduceMotion;
  if (!shouldBoot) {
    boot.remove();
    return;
  }

  const dismissBoot = () => {
    if (boot.classList.contains("done")) return;

    document.documentElement.classList.remove("is-booting");
    boot.classList.add("done");
    window.setTimeout(() => boot.remove(), 600);
  };

  const lines = bootLines();
  let line = 0;
  const writeLine = () => {
    bootLog.innerHTML += `${lines[line]}\n`;
    line += 1;

    if (line >= lines.length) {
			window.setTimeout(dismissBoot, 600);
      return;
    }

		window.setTimeout(writeLine, 320);
  };

	window.setTimeout(writeLine, 180);

  window.addEventListener("keydown", dismissBoot, { once: true });
  boot.addEventListener("click", dismissBoot);
};
