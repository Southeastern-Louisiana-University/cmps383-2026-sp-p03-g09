import React, { createContext, useContext, useMemo, useState } from "react";
import { Appearance } from "react-native";

export type ThemeName = "light" | "dark" | "oled";

export interface ThemePalette {
  bg: string;
  text: string;
  surface: string;
  elevated: string;
  subtle: string;
  accent: string;
  danger: string;
  success: string;
}

export interface ButtonTokens {
  bg: string;
  border: string;
  text: string;
  radius: number;
  px: number;
  py: number;
  borderWidth: number;
}

const PALETTES: Record<ThemeName, ThemePalette> = {
  light: {
    bg: "#f8f7ff",        
    text: "#1c1a3a",        
    surface: "#eef2ff",   
    elevated: "#ffffff",   
    subtle: "#a5b4fc",     
    accent: "#5f71e9",      
    danger: "#e5484d",
    success: "#4ade80",  
  },  
  dark: {
    bg: "#1e1b4b",
    text: "#f1f0ff",
    surface: "#2e2a6e",
    elevated: "#3b3680",
    subtle: "#4c4899",
    accent: "#a5b4fc",
    danger: "#e5484d",
    success: "#4ade80",
  },
  oled: {
    bg: "#000000",
    text: "#f1f0ff",
    surface: "#0d0b2a",
    elevated: "#1a1740",
    subtle: "#2e2a6e",
    accent: "#a5b4fc",
    danger: "#ff6b6f",
    success: "#6ee7b7",
  },
};

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  palette: ThemePalette;
  isDark: boolean;
  isOled: boolean;
  buttons: ButtonTokens;
  successButtons: ButtonTokens;
  accentButtons: ButtonTokens;
}

const initialTheme = (Appearance.getColorScheme() as ThemeName) || "dark";

const ThemeContext = createContext<ThemeContextValue>({
  theme: initialTheme,
  setTheme: () => {},
  palette: PALETTES[initialTheme],
  isDark: initialTheme === "dark",
  isOled: initialTheme === "oled",
  buttons: {
    bg: PALETTES[initialTheme].surface,
    border: PALETTES[initialTheme].subtle,
    text: PALETTES[initialTheme].text,
    radius: 20,
    px: 14,
    py: 8,
    borderWidth: 1,
  },
  successButtons: {
    bg: PALETTES[initialTheme].success,
    border: PALETTES[initialTheme].success,
    text: "#1e1b4b",
    radius: 20,
    px: 14,
    py: 8,
    borderWidth: 1,
  },
  accentButtons: {
    bg: PALETTES[initialTheme].accent,
    border: PALETTES[initialTheme].accent,
    text: "#1e1b4b",
    radius: 20,
    px: 14,
    py: 8,
    borderWidth: 1,
  },
});

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      palette: PALETTES[theme],
      isDark: theme === "dark",
      isOled: theme === "oled",
      buttons: ((): ButtonTokens => ({
        bg: theme === "light" ? "#e8e6ff" : PALETTES[theme].surface,
        border: theme === "light" ? "#a5b4fc" : PALETTES[theme].subtle,
        text: PALETTES[theme].text,
        radius: 20,
        px: 14,
        py: 8,
        borderWidth: theme === "light" ? 1 : 2,
      }))(),
      successButtons: ((): ButtonTokens => ({
        // mint green on dark purple — pops nicely against the palette
        bg: theme === "light" ? "#059669" : "#6ee7b7",
        border: theme === "light" ? "#34d399" : "#6ee7b7",
        text: theme === "light" ? "#ffffff" : "#1e1b4b",
        radius: 20,
        px: 14,
        py: 8,
        borderWidth: 1,
      }))(),
      accentButtons: ((): ButtonTokens => ({
        // periwinkle accent — the signature caffeinated lions color
        bg: theme === "light" ? "#a5b4fc" : "rgba(165,180,252,0.25)",
        border: "#a5b4fc",
        text: theme === "light" ? "#1e1b4b" : "#f1f0ff",
        radius: 20,
        px: 14,
        py: 8,
        borderWidth: theme === "light" ? 1 : 2,
      }))(),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}