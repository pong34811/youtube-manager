import useLocaleStore from "../stores/localeStore";
import { th, en } from "../locales/translations";

const all = { th, en };

export function useLocale() {
  const { locale, toggleLocale, setLocale } = useLocaleStore();
  const t = (key) => all[locale][key] || key;
  return { locale, toggleLocale, setLocale, t };
}
