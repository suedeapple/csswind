# csswind — project guide

## Stack

- **React 19** — single component (`src/App.jsx`) managing all quiz state
- **Vite 8** — dev server and build tool (`npm run dev`, `npm run build`)
- **DM Mono** — monospace font loaded from Google Fonts, used throughout
- No routing, no state library, no CSS framework

## Key files

| File                      | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `src/App.jsx`             | Main component: game logic, state, rendering                   |
| `src/main.jsx`            | Entry point — mounts App                                       |
| `src/lib/pool.js`         | Question bank — the only file to edit when adding questions    |
| `src/lib/score-message.js`| End-of-round score message copy                                |
| `src/App.css`             | All component styles                                           |
| `src/index.css`           | Global reset, CSS variables (colours, fonts, radii), keyframes |
| `public/favicon.svg`      | Site favicon                                                   |
| `public/logo.svg`         | Site logo                                                      |
| `public/og.png`           | Open Graph image                                               |
| `index.html`              | HTML shell — Google Fonts import lives here                    |

## CSS variables

All design tokens live in `src/index.css` under `:root`. Changing them reskins the whole app.

```css
--bg, --surface, --surface2   /* backgrounds */
--border                      /* borders */
--text, --muted               /* foreground */
--accent, --green             /* primary green (#4ade80) */
--red, --amber                /* wrong / warning states */
--font, --mono                /* both DM Mono */
--radius                      /* 2px — sharp corners */
--max-w                       /* 540px content column */
```

## Adding questions

All questions live in `src/lib/pool.js` as an exported array of `{ tw, css }` pairs:

```js
{ tw: "flex", css: "display: flex" }
```

- `tw` is the Tailwind class name
- `css` is the full CSS declaration (property + value, no semicolon needed)

Direction (mixed, TW → CSS, or CSS → TW), question count (10, 15, 20), and difficulty (easy, medium, expert) are all chosen by the player before each round.

Answer checking is forgiving: case, spaces around `:` and `/`, and trailing semicolons are all normalised before comparison.

### Example additions

```js
{ tw: "sr-only", css: "position: absolute" },
{ tw: "truncate", css: "overflow: hidden" },
{ tw: "not-sr-only", css: "position: static" },
```

For arbitrary value entries, match the format exactly as Tailwind outputs it:

```js
{ tw: "w-[200px]", css: "width: 200px" },
```

## Game options

Configured by the player on the home screen:

| Option | Values |
| ------ | ------ |
| Difficulty | easy, medium, expert |
| Questions | 10 (2 min), 15 (3 min), 20 (4 min) |
| Direction | mixed, TW → CSS, CSS → TW |
