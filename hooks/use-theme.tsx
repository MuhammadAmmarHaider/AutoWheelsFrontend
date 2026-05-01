import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";
import { Appearance } from "react-native";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  systemTheme: string | null | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useNativeColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  useEffect(() => {
    // Keep app theme in sync with OS theme automatically.
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === "dark");
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleTheme, systemTheme: systemColorScheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
