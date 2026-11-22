# Regex Playground

An offline-first, browser-based JavaScript regular-expression learning environment.

## Features

- Live regex tester with match highlighting, match positions and capture groups.
- Global, ignore-case, multiline, dotAll, Unicode, sticky and indices flags.
- Replacement preview using JavaScript replacement syntax.
- Pattern explanation hints.
- Guided lessons from literal matching through lookarounds, Unicode and regex safety.
- Searchable syntax reference and practical recipe collection.
- Multiple-choice challenges with explanations.
- Save patterns locally; import and export JSON backups.
- Installable PWA with service-worker caching.

## Run locally

Serve this directory over HTTP (service workers require a secure context; localhost is treated as secure):

```sh
python -m http.server 8000
```

Open http://localhost:8000.

## Deploy to GitHub Pages

1. Open repository Settings → Pages.
2. Choose **Deploy from a branch**.
3. Select `main` and `/ (root)`, then Save.
4. Wait for the Pages deployment. The project site will be available at the repository's GitHub Pages URL.

All paths are relative so the app works from a GitHub Pages project subpath.

## Compatibility and safety

The playground uses the browser's native JavaScript `RegExp` implementation, not PCRE. Syntax support depends on the visitor's browser. User patterns and saved data remain in the browser. LocalStorage is used for saved patterns and lesson progress.

Regexes with catastrophic backtracking can freeze a page on large inputs. Avoid running untrusted complex patterns or very large test strings. This static app cannot impose a reliable timeout on the browser's native regex engine.

## License

MIT
