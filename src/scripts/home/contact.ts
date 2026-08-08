export const initCopyEmail = () => {
	const copyEmailButton = document.querySelector<HTMLButtonElement>("[data-copy-email]");
	if (!copyEmailButton) return;

	const email = copyEmailButton.dataset.copyEmail;
	const label = copyEmailButton.textContent?.trim() ?? "Copy";
	let resetTimer = 0;

	copyEmailButton.addEventListener("click", async () => {
		if (!email) return;

		try {
			if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
			await navigator.clipboard.writeText(email);
			window.clearTimeout(resetTimer);
			copyEmailButton.textContent = "Copied \u2713";
			copyEmailButton.setAttribute("aria-label", `${email} copied to clipboard`);
			copyEmailButton.classList.add("is-copied");

			resetTimer = window.setTimeout(() => {
				copyEmailButton.textContent = label;
				copyEmailButton.setAttribute("aria-label", `Copy email address ${email}`);
				copyEmailButton.classList.remove("is-copied");
			}, 1800);
		} catch (error) {
			window.location.href = `mailto:${email}`;
		}
	});
};
