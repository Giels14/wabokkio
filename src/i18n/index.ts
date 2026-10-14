import nl from './nl';
import en from './en';
import type { Lang } from './routes';
export * from './routes';
export const dict = { nl, en };
export const t = (lang: Lang) => dict[lang];
