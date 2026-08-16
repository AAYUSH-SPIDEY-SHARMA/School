/**
 * Class levels — THE single definition for the whole codebase.
 *
 * ⚠️ HARD INVARIANT (99_CLAUDE_WORKING_RULES): the school serves
 * **Nursery through Class 10**. There is no Class 11, no Class 12, no streams
 * and no senior secondary — not in routes, enums, dropdowns or page copy.
 *
 * This list exists in exactly one place on purpose. The invariant appears in
 * several surfaces (the enquiry form, the academics section, the admin filter),
 * and duplicating it is how it eventually drifts in one of them.
 *
 * The Prisma `ClassLevel` enum mirrors this list; the two are kept in step by a
 * unit test that fails if they diverge.
 */

export const CLASS_LEVELS = [
  'NURSERY',
  'LKG',
  'UKG',
  'CLASS_1',
  'CLASS_2',
  'CLASS_3',
  'CLASS_4',
  'CLASS_5',
  'CLASS_6',
  'CLASS_7',
  'CLASS_8',
  'CLASS_9',
  'CLASS_10',
] as const;

export type ClassLevelValue = (typeof CLASS_LEVELS)[number];

/** Human-readable labels, for forms and public copy. */
export const CLASS_LEVEL_LABELS: Record<ClassLevelValue, string> = {
  NURSERY: 'Nursery',
  LKG: 'LKG',
  UKG: 'UKG',
  CLASS_1: 'Class 1',
  CLASS_2: 'Class 2',
  CLASS_3: 'Class 3',
  CLASS_4: 'Class 4',
  CLASS_5: 'Class 5',
  CLASS_6: 'Class 6',
  CLASS_7: 'Class 7',
  CLASS_8: 'Class 8',
  CLASS_9: 'Class 9',
  CLASS_10: 'Class 10',
};

/**
 * Academic stages, used by the `/academics` section.
 * Secondary stops at Class 10 — see the invariant above.
 */
export const ACADEMIC_STAGES = [
  {
    slug: 'pre-primary',
    label: 'Pre-Primary',
    levels: ['NURSERY', 'LKG', 'UKG'],
  },
  {
    slug: 'primary',
    label: 'Primary',
    levels: ['CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5'],
  },
  {
    slug: 'middle-school',
    label: 'Middle School',
    levels: ['CLASS_6', 'CLASS_7', 'CLASS_8'],
  },
  {
    slug: 'secondary-school',
    label: 'Secondary School',
    levels: ['CLASS_9', 'CLASS_10'],
  },
] as const satisfies ReadonlyArray<{
  slug: string;
  label: string;
  levels: ReadonlyArray<ClassLevelValue>;
}>;

export type AcademicStageSlug = (typeof ACADEMIC_STAGES)[number]['slug'];

/** Options for a `<select>`, in the order a parent expects to read them. */
export const CLASS_LEVEL_OPTIONS = CLASS_LEVELS.map((value) => ({
  value,
  label: CLASS_LEVEL_LABELS[value],
}));

export function isClassLevel(value: unknown): value is ClassLevelValue {
  return (
    typeof value === 'string' &&
    (CLASS_LEVELS as readonly string[]).includes(value)
  );
}
