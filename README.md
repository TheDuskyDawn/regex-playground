# Regex Playground

An offline-first, browser-based JavaScript regular-expression learning environment. It runs entirely in the browser: no account, API key, server, analytics, or build step is required.

## Features

- Live JavaScript regex tester with highlighted matches, positions, numbered captures and named captures.
- Global, ignore-case, multiline, dotAll, Unicode, sticky and indices flags.
- Replacement preview using JavaScript replacement syntax.
- Pattern explanations and live heuristic diagnostics for common mistakes and backtracking risks.
- 15 guided lessons, searchable syntax reference, and practical recipe collection.
- Multiple-choice challenges with explanations and a running score.
- Save patterns locally; import and export JSON backups.
- Installable progressive web app with service-worker caching and offline shell support.

## Run locally

Serve this directory over HTTP (service workers require a secure context; localhost is treated as secure):

```sh
python -m http.server 8000
```

Open http://localhost:8000.

## Deploy to GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. The workflow in `.github/workflows/pages.yml` deploys automatically on pushes to `main`; it can also be started manually from the Actions tab.
4. After the workflow succeeds, open the Pages URL shown in the workflow deployment summary.

All asset paths are relative, so the app works from a GitHub Pages project subpath.

## Run automated tests

Requires Node.js 18 or later. The app itself does not require Node.

```sh
npm test
```

The test suite exercises representative JavaScript regex syntax, flags, captures, replacement behavior, Unicode matching, zero-width matches, and invalid patterns.

## Compatibility and safety

The playground uses the browser's native JavaScript `RegExp` implementation, not PCRE. Syntax support depends on the visitor's browser. User patterns and saved data remain in the browser. LocalStorage is used for saved patterns and lesson progress.

The diagnostics are educational heuristics, not a formal complexity analyzer. Regexes with catastrophic backtracking can freeze a page on large inputs. Avoid running untrusted complex patterns or very large test strings. This static app cannot impose a reliable timeout on the browser's native regex engine.

## License

MIT
