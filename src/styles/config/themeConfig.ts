export const themes = {
  light: {
    "--primary": "#2563eb",
    "--background": "#ffffff",
    "--text": "#111827",
    "--border": "#d1d5db",
  },

  dark: {
    "--primary": "#22c55e",
    "--background": "#020617",
    "--text": "#f8fafc",
    "--border": "#334155",
  },

  cosmic: {
    "--primary": "#7c3aed",
    "--background": "#0f0222",
    "--text": "#f5f3ff",
    "--border": "#a78bfa",
  },
};

export const applyTheme = (themeName: keyof typeof themes) => {
  const theme = themes[themeName];

  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};
