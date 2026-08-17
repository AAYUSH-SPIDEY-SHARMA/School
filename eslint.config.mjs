import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * ESLint flat config.
 *
 * `eslint-config-next` in the 16 line already exports flat config arrays, so
 * they are spread directly — no `FlatCompat` shim.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // An unused variable is usually a half-finished thought, and inside a
      // Server Action it is occasionally a validation result nobody checked.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // `any` erases exactly the guarantees this project relies on at the
      // Server Action boundary.
      '@typescript-eslint/no-explicit-any': 'error',

      // `console.log` left in a Server Action prints straight into platform
      // logs, and enquiry handlers are one `console.log(input)` away from
      // logging a parent's phone number.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  {
    /**
     * The ORM is importable only from the data layer.
     *
     * Components never import Prisma directly — all access goes through
     * `lib/queries` (reads) or `lib/actions` (writes). That is what makes the
     * soft-delete filter and the authorisation check impossible to forget
     * (15_BACKEND_ARCHITECTURE, 36_PROJECT_STRUCTURE).
     *
     * Scoped to the directories where a violation would actually matter.
     */
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      // The TypeScript-aware variant, so `allowTypeImports` is available.
      // A type-only import of `Role` is erased at compile time and reaches no
      // database — banning it would push components to redeclare enum types by
      // hand, which is how a role string silently drifts out of sync with the
      // schema. The runtime import is what must stay blocked.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@prisma/client', '@/lib/db/*', '**/lib/db/*'],
              allowTypeImports: true,
              message:
                'Components and pages must not import the ORM at runtime. Reads go through lib/queries, writes through lib/actions (15_BACKEND_ARCHITECTURE). Type-only imports are fine.',
            },
          ],
        },
      ],
    },
  },

  {
    // Verification scripts print their results — that is their entire output.
    files: ['tests/**/*.{ts,tsx,mjs,js}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default config;
