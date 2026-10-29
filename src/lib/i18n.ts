import el from "../data/translations/el.json";
import en from "../data/translations/en.json";
import ru from "../data/translations/ru.json";
import { typograph } from "./typography";

// Each language is its own static page: /ru/, /en/, /el/.
export const languages = {
  ru: { code: "ru", name: "Русский" },
  en: { code: "en", name: "English" },
  el: { code: "el", name: "Ελληνικά" },
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = "en";

export type Translations = typeof ru;

// satisfies keeps en and el in step with ru: a missing key fails the build.
const source = { ru, en, el } satisfies Record<Language, Translations>;

// JSON stays plain text; no-break spaces are added once, here.
const translations = typograph(source);

export const getTranslations = (lang: Language): Translations => translations[lang];

export const languagePath = (lang: Language) => `/${lang}/`;
