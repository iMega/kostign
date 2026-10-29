// Opens a collapsed area a link points to. The page works without
// JavaScript: the areas then open by a click on their title.

const openDetails = (hash: string) => {
  const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (target instanceof HTMLDetailsElement) target.open = true;
};

// On click, not only on hashchange: a second click on the same link
// after the area was closed does not change the hash.
document.addEventListener("click", (e) => {
  const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (link) openDetails(link.hash);
});
addEventListener("hashchange", () => openDetails(location.hash));
openDetails(location.hash);
