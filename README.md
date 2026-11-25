# Somdoku

Daily Japanese sums puzzle for mobile. Everyone gets the same puzzle; scores are shared as an emoji
grid, like Wordle. English and Dutch, based on the browser language.

```bash
npm install
npm run dev
npm run check
npm run deploy
```

`npm run check` runs the typecheck (`tsc -b`), ESLint, Prettier and the tests. `npm install`
installs the lefthook git hooks:

- pre-commit: ESLint and Prettier on staged files, `tsc -b`
- commit-msg: commitlint (Conventional Commits)
- pre-push: all checks

## Structure

- `src/lib/`: puzzle generator, solver and game logic. Puzzles are seeded by date, so changing the
  generator changes all of them.
- `src/stores/`: zustand stores for the game and the UI. Game state persists in `localStorage`.
- `src/features/`: screens (`ready`, `play`, `done`), top bar and rules dialog.
- `src/components/`, `src/hooks/`, `src/utils/`: shared components, clock and keyboard hooks,
  haptics.
- `src/locales/`: en/nl translations (react-i18next).
- `src/sw.ts`: service worker for offline use and install.
- `functions/_middleware.ts`: redirects www.somdoku.nl and somdoku.pages.dev to somdoku.nl.
- `art/`: sources for the icon and `og.png` (`npm run icons`, `npm run og`).
