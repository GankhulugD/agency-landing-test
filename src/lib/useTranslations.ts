import { useLanguage } from "@/contexts/LanguageContext";
import { translations, type Language } from "./translations";

export function useTranslations() {
  const { language } = useLanguage();
  
  return translations[language as Language];
}
