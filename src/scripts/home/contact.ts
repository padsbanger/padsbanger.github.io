export const initCopyEmail = () => {
  const copyEmailLink = document.querySelector<HTMLAnchorElement>("[data-copy-email]");
  if (!copyEmailLink) return;

  const email = copyEmailLink.dataset.copyEmail;
  const label = copyEmailLink.textContent?.trim() ?? "";
  let resetTimer = 0;

  copyEmailLink.addEventListener("click", async (event) => {
    if (!email || !navigator.clipboard?.writeText) return;

    event.preventDefault();

    try {
      await navigator.clipboard.writeText(email);
      window.clearTimeout(resetTimer);
      copyEmailLink.textContent = "copied \u2713";
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
};
