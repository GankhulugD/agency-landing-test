"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "en" | "mn";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("namoon-language") as Language | null;
    if (saved === "mn" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dataset.lang = language;
    root.classList.remove("lang-en", "lang-mn");
    root.classList.add(language === "mn" ? "lang-mn" : "lang-en");
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("namoon-language", lang);
  };

  const t = (key: string) => {
    // This will be handled by each component accessing translations directly
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
