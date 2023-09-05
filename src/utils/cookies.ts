export function deleteCookie(cookieName: string) {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  document.cookie = `${cookieName}=; expires=${pastDate.toUTCString()}; path=/`;
}
