# Changelog

## 2.0.0

### Breaking changes

- Depends on `api-poller-worker` 2. See its changelog for what changed.
- React is a peer dependency of version 18 or later. Version 1 asked for React 16.8.
- The package has an `exports` map, so deep imports from `dist/` no longer work.

### Fixes

- The worker was created again whenever the callback changed. With an inline callback, that was every render, so a component could start a new worker each time it rendered. The hook now keeps the latest callbacks in a ref, and only replaces the worker when the options change.
- Workers were stopped but never terminated, so each one stayed alive after the component unmounted or the worker was replaced. They're now terminated.
- Changing the options, such as `apiUrl`, had no effect. The worker is now replaced with one using the new options.
- The README said `Msg` was re-exported, but it wasn't. `Msg`, `Records`, `ApiPollerWorkerOptions` and `createEmptyMsg` are now exported.

### Other changes

- New optional `onError` argument, called when polling fails.
- `useApiPollerWorker` is a named export as well as the default export.
- Ships ES modules and CommonJS, with TypeScript types for both. Built with tsup and tested with Vitest. CI runs on GitHub Actions, and releases are published from GitHub with npm provenance.
