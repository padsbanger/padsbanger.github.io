export const initFooterClock = () => {
  const clock = document.getElementById("sys-clock");
	const zone = document.getElementById("sys-zone");
	if (!clock && !zone) return;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Warsaw",
		timeZoneName: "short",
  });

  const tickClock = () => {
		const parts = formatter.formatToParts(new Date());
		if (clock) {
			clock.textContent = parts
				.filter(({ type }) => type === "hour" || type === "minute" || type === "second" || type === "literal")
				.map(({ value }) => value)
				.join("")
				.replace(/\s+/g, "")
				.replace(/,$/, "");
		}
		if (zone) {
			zone.textContent = parts.find(({ type }) => type === "timeZoneName")?.value ?? "";
		}
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

};
