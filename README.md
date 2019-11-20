# @brianmcallister/use-api-poller-worker

[![codecov](https://codecov.io/gh/brianmcallister/use-api-poller-worker/branch/master/graph/badge.svg)](https://codecov.io/gh/brianmcallister/use-api-poller-worker) [![CircleCI](https://circleci.com/gh/brianmcallister/use-api-poller-worker.svg?style=svg)](https://circleci.com/gh/brianmcallister/use-api-poller-worker) [![npm version](https://img.shields.io/npm/v/@brianmcallister/use-api-poller-worker?label=version&color=%2354C536&logo=npm)](https://www.npmjs.com/package/@brianmcallister/use-api-poller-worker)

> React hook for @brianmcallister/api-poller-worker

`use-api-poller-worker` is a React hook that you can use to integrate [`@brianmcallister/api-poller-worker`](https://github.com/brianmcallister/api-poller-worker) into your React app.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - Functions
    - [`useApiPollerWorker`](#useapipollerworker)
  - Types
    - [`Msg<T>`](#msgt)

###### [⇡ Top](#table-of-contents)

## Installation

```sh
npm install @brianmcallister/use-api-poller-worker
```

###### [⇡ Top](#table-of-contents)

## Usage

This hook takes the same options as the `ApiPollerWorker` class from [`@brianmcallister/api-poller-worker`](https://github.com/brianmcallister/api-poller-worker), plus an extra `callback` argument which will be called when the underlying worker emits a message.

It's recommended to wrap your callback in `React.useCallback`, so that your app does not unnecessarily re-render multiple times.

```ts
const MyComponent = () => {
  const [items, setItems] = React.useState<Item>(null);
  const callback = React.useCallback<(data: Msg<Item>) => void>(data => {
    setItems(data);
  }, [setItems]);

  useApiPollerWorker<Item>({
    workerUrl: '<my api endpoint>',
  }, callback);

  return {
    <div>
      {items}
    </div>
  };
};
```

###### [⇡ Top](#table-of-contents)

## API

### Functions

#### `useApiPollerWorker`

This is the default export.

```ts
import useApiPollerWorker from '@brianmcallister/use-api-poller-worker';

function useApiPollerWorker<T extends {}>(
  options: ApiPollerWorkerOptions,
  callback: (data: Msg<T>) => void,
)
```

Both `ApiPollerWorkerOptions` and `Msg<T>` come from [`@brianmcallister/api-poller-worker`](https://github.com/brianmcallister/api-poller-worker). You might want to import `Msg<T>` for type safety. This library re-exports `Msg<T>` for convenience.

`useApiPollerWorker` also accepts a generic, `T` for the type of resource you're polling.

###### [⇡ Top](#table-of-contents)

### Types

#### `Msg<T>`

Represents the contents of a message from the underlying polling library.

```ts
import { Msg } from '@brianmcallister/use-api-poller-worker';
```

```ts
interface Msg<T> {
  newItems: Records<T>;
  updatedItems: Records<T>;
  removedItems: string[];
}
```

###### [⇡ Top](#table-of-contents)
