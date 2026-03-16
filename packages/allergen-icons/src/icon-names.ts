export const allergenIconNames = [
  "celery",
  "crustacean",
  "egg",
  "fish",
  "gluten",
  "lupin",
  "milk",
  "mollusc",
  "mustard",
  "nuts",
  "peanut",
  "sesame",
  "soya",
  "sulphite"
] as const

export type AllergenIconName = (typeof allergenIconNames)[number]
