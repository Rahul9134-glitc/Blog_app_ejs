document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-toggle');
  const icon = themeBtn.querySelector('i');
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
    icon.classList.replace('bi-moon', 'bi-sun');
  }

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const darkMode = document.body.classList.contains('dark');
    icon.classList.toggle('bi-moon', !darkMode);
    icon.classList.toggle('bi-sun', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  });
});
