# Somdoku

A Japanese sums puzzle every day, made for phones. Everyone gets the same puzzle; afterwards you
share your score as a picture of squares, as with Wordle. In English and Dutch, following the
browser's language.

```bash
npm install
npm run dev
npm run check
npm run deploy
```

`npm run check` runs `tsc -b` (strict), ESLint, Prettier (with sorted imports) and the tests.
`npm install` sets up the git hooks through lefthook: on commit, ESLint and Prettier on the changed
files plus `tsc -b`, and commitlint on the message (Conventional Commits); on push, every check.

## How it works

- `src/lib/`: the rules, generator and solver, and the game logic. No React, no DOM. As in the puzzle
  booklet: 5 by 5, digits 1 to 4, every digit exactly once and one black cell per row and column;
  the corner of the grid says what goes in. A day's puzzle comes from its date, so changing the
  generator changes every day.
- `src/stores/`: zustand stores for the game and the UI. The game is kept in `localStorage`.
  `?oefen=1`, `?oefen=2`, … gives a practice puzzle, `&maat=4` or `&maat=6` a smaller or larger one:
  4 by 4 with digits 1 to 3, 6 by 6 with 1 to 4 and two black cells per row and column.
- `src/features/`: the screens (`play`, `done`), the top bar and the rules.
- `src/hooks/`, `src/utils/`: shared pieces, the keyboard, the change of day and storage.
- `src/locales/`: English and Dutch translations (react-i18next).
- `src/sw.ts`: the service worker, so the game installs as an app and works offline.
- `functions/_middleware.ts`: sends www.somdoku.nl and somdoku.pages.dev on to somdoku.nl.
- `art/`: source of the icon and `og.png`, the picture WhatsApp shows with the link; `npm run icons`
  makes the icon again in every size, the top of `art/og.html` says how to make `og.png`.
