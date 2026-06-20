const pad = (value: number) => String(value).padStart(2, "0");

export const initFooterClock = () => {
  const clock = document.getElementById("sys-clock");
  if (!clock) return;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Warsaw",
  });

  const tickClock = () => {
    clock.textContent = formatter.format(new Date());
  };

  tickClock();
  window.setInterval(tickClock, 1000);
};

export const initFooterEasterEgg = () => {
  const viewSourceLink = document.querySelector<HTMLAnchorElement>("[data-view-source]");
  if (viewSourceLink) {
    const sourceUrl = new URL(window.location.href);
    sourceUrl.hash = "";
    viewSourceLink.setAttribute("href", `view-source:${sourceUrl.href}`);
  }

  const uptime = document.getElementById("sys-uptime");
  if (!uptime) return;

  const launchedAt = Date.parse("2024-11-01T00:00:00Z");
  const tickUptime = () => {
    const elapsed = Math.max(0, Math.floor((Date.now() - launchedAt) / 1000));
    const days = Math.floor(elapsed / 86400);
    const hours = Math.floor((elapsed % 86400) / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    uptime.textContent = days > 0 ? `${days}d ${clock}` : clock;
  };

  tickUptime();
  window.setInterval(tickUptime, 1000);
};

export const initHeroHud = () => {
  const hudClock = document.getElementById("hud-clock");
  const hudDate = document.getElementById("hud-date");
  if (!hudClock && !hudDate) return;

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  const tickHud = () => {
    const now = new Date();
    if (hudClock) hudClock.textContent = timeFormatter.format(now);
    if (hudDate) hudDate.textContent = dateFormatter.format(now).toUpperCase();
  };

  tickHud();
  window.setInterval(tickHud, 1000);
};
