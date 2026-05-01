export const APP_COLORS = {
  light: {
    background: "#ffffff",
    surface: "#f8f9fa",
    textPrimary: "#11181C",
    textSecondary: "#687076",
    border: "#e5e7eb",
    tabActive: "#338b9d",
    tabInactive: "#687076",
    sellNowBg: "#63df4e",
    onAccent: "#ffffff",
  },
  dark: {
    background: "#0f1419",
    surface: "#1a1f26",
    textPrimary: "#ecedee",
    textSecondary: "#9ba1a6",
    border: "#2d3748",
    tabActive: "#338b9d",
    tabInactive: "#9ba1a6",
    sellNowBg: "#63df4e",
    onAccent: "#ffffff",
  },
} as const;

export const getAppColors = (isDark: boolean) =>
  isDark ? APP_COLORS.dark : APP_COLORS.light;
