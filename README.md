<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/brianmcallister/use-api-poller-worker/main/.github/assets/logo-dark.svg">
    <img alt="use-api-poller-worker" src="https://raw.githubusercontent.com/brianmcallister/use-api-poller-worker/main/.github/assets/logo-light.svg" height="48">
  </picture>
</h1>

[![CI](https://github.com/brianmcallister/use-api-poller-worker/actions/workflows/ci.yml/badge.svg)](https://github.com/brianmcallister/use-api-poller-worker/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/use-api-poller-worker?label=version&color=%2354C536&logo=npm)](https://www.npmjs.com/package/use-api-poller-worker)

> React hook for api-poller-worker

`use-api-poller-worker` is a React hook that you can use to integrate [`api-poller-worker`](https://github.com/brianmcallister/api-poller-worker) into your React app.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [`useApiPollerWorker`](#useapipollerworker)
  - [Types](#types)
- [Upgrading from 1.x](#upgrading-from-1x)

###### [⇡ Top](#table-of-contents)

## Installation

```sh
npm install use-api-poller-worker
```

###### [⇡ Top](#table-of-contents)

## Usage

```tsx
import { useState } from 'react';
import useApiPollerWorker from 'use-api-poller-worker';

const Products = () => {
  const [products, setProducts] = useState<Record<string, Product>>({});

  useApiPollerWorker<Product>(
    { inline: true, apiUrl: 'https://example.com/api/products' },
    (msg) => {
      setProducts((current) => {
        const next = { ...current, ...msg.newItems.byId, ...msg.updatedItems.byId };

        for (const id of msg.removedItems) {
          delete next[id];
        }

        return next;
      });
    },
    (error) => {
      console.error('Polling failed', error);
    },
  );

  return (
    <ul>
      {Object.values(products).map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
};
```

The hook starts polling when the component mounts, and shuts the worker down when it unmounts. The worker is only replaced when the options change, so the callbacks can be new functions on every render. There's no need for `useCallback`.

###### [⇡ Top](#table-of-contents)

## API

### `useApiPollerWorker`

The default export, also available as a named export.

```ts
useApiPollerWorker<T>(
  options: ApiPollerWorkerOptions,
  onMessage: (msg: Msg<T>) => void,
  onError?: (error: Error) => void,
): void;
```

- `options`: the same options as [`ApiPollerWorker`](https://github.com/brianmcallister/api-poller-worker#apipollerworkeroptions). Use `inline` with `apiUrl` for the worker built into `api-poller-worker`, or `worker` or `workerUrl` for your own.
- `onMessage`: called with what changed after each response. See [`Msg<T>`](https://github.com/brianmcallister/api-poller-worker#msgt).
- `onError`: called when a request fails or the response isn't an array of objects.

`T` is the type of the objects the API returns.

### Types

`Msg<T>`, `Records<T>` and `ApiPollerWorkerOptions` are re-exported from `api-poller-worker`, along with `createEmptyMsg`:

```ts
import { createEmptyMsg, type Msg } from 'use-api-poller-worker';
```

###### [⇡ Top](#table-of-contents)

## Upgrading from 1.x

- The hook uses `api-poller-worker` 2, where inline workers work and errors are reported. See its [upgrade notes](https://github.com/brianmcallister/api-poller-worker#upgrading-from-1x).
- React is a peer dependency of version 18 or later.
- There's a new optional `onError` argument.
- The package has an `exports` map, so deep imports from `dist/` no longer work.

See the [changelog](CHANGELOG.md) for everything else.

###### [⇡ Top](#table-of-contents)
