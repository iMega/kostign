// A word of one or two letters (и, в, на, из, to, of, το…) is bound to the
// next one with a no-break space, so a line never ends with it. Lookbehind
// does not consume the preceding space: "и их приводов" binds both words.
const shortWord = /(?<=^|[\s«„"(])(\p{L}{1,2}) +/gu;

export const nbsp = (text: string) => text.replace(shortWord, "$1\u00a0");

type Deep<T> = T extends string ? string : { [K in keyof T]: Deep<T[K]> };

// Applies nbsp to every string in a translation tree.
export const typograph = <T>(value: T): Deep<T> => {
  if (typeof value === "string") return nbsp(value) as Deep<T>;
  if (Array.isArray(value)) return value.map(typograph) as unknown as Deep<T>;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typograph(v)])) as Deep<T>;
  }
  return value as Deep<T>;
};
