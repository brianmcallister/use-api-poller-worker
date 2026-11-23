import { renderHook } from '@testing-library/react';
import type { ApiPollerWorkerOptions, Msg } from 'api-poller-worker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useApiPollerWorkerDefault, { useApiPollerWorker } from '../index';

// The mock factory below is hoisted, so the stand-in has to be defined with it.
const { FakePoller } = vi.hoisted(() => {
  /** A stand-in for ApiPollerWorker that records how it's used. */
  class FakePoller {
    static instances: FakePoller[] = [];

    readonly options: ApiPollerWorkerOptions;

    terminated = false;

    messageListener: ((msg: Msg<{ id: string }>) => void) | undefined;

    errorListener: ((error: Error) => void) | undefined;

    constructor(options: ApiPollerWorkerOptions) {
      this.options = options;
      FakePoller.instances.push(this);
    }

    onMessage(listener: (msg: Msg<{ id: string }>) => void) {
      this.messageListener = listener;

      return this;
    }

    onError(listener: (error: Error) => void) {
      this.errorListener = listener;

      return this;
    }

    terminate() {
      this.terminated = true;
    }
  }

  return { FakePoller };
});

vi.mock('api-poller-worker', async (importOriginal) => ({
  ...(await importOriginal<typeof import('api-poller-worker')>()),
  ApiPollerWorker: FakePoller,
}));

const live = () => FakePoller.instances.filter((poller) => !poller.terminated);

const msg: Msg<{ id: string }> = {
  newItems: { ids: ['a'], byId: { a: { id: 'a' } } },
  updatedItems: { ids: [], byId: {} },
  removedItems: [],
};

beforeEach(() => {
  FakePoller.instances = [];
});

describe('useApiPollerWorker', () => {
  it('is the default export', () => {
    expect(useApiPollerWorkerDefault).toBe(useApiPollerWorker);
  });

  it('creates a poller with the options', () => {
    renderHook(() => {
      useApiPollerWorker({ inline: true, apiUrl: '/api', interval: 500 }, vi.fn());
    });

    expect(live()).toHaveLength(1);
    expect(live()[0]?.options).toMatchObject({ inline: true, apiUrl: '/api', interval: 500 });
  });

  // Regression: with a new callback on each render, every render created another worker, and none
  // of them were ever shut down.
  it('keeps one worker across renders with new callbacks and options objects', () => {
    const { rerender } = renderHook(
      ({ label }: { label: string }) => {
        useApiPollerWorker(
          { inline: true, apiUrl: '/api', fetchOptions: { headers: { a: 'b' } } },
          (data) => label + String(data.newItems.ids.length),
        );
      },
      { initialProps: { label: 'one' } },
    );

    rerender({ label: 'two' });
    rerender({ label: 'three' });

    expect(FakePoller.instances).toHaveLength(1);
  });

  it('calls the latest callbacks', () => {
    const first = vi.fn();
    const second = vi.fn();
    const onError = vi.fn();
    const { rerender } = renderHook(
      ({ callback }: { callback: (data: Msg<{ id: string }>) => void }) => {
        useApiPollerWorker({ workerUrl: '/worker.js' }, callback, onError);
      },
      { initialProps: { callback: first } },
    );

    rerender({ callback: second });
    live()[0]?.messageListener?.(msg);
    live()[0]?.errorListener?.(new Error('nope'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(msg);
    expect(onError).toHaveBeenCalledWith(new Error('nope'));
  });

  it('replaces the worker when the options change', () => {
    const { rerender } = renderHook(
      ({ apiUrl }: { apiUrl: string }) => {
        useApiPollerWorker({ inline: true, apiUrl }, vi.fn());
      },
      { initialProps: { apiUrl: '/one' } },
    );

    rerender({ apiUrl: '/two' });

    expect(FakePoller.instances).toHaveLength(2);
    expect(FakePoller.instances[0]?.terminated).toBe(true);
    expect(live()[0]?.options.apiUrl).toBe('/two');
  });

  // Regression: the worker was only stopped on unmount, so it was never shut down.
  it('terminates the worker on unmount', () => {
    const { unmount } = renderHook(() => {
      useApiPollerWorker({ workerUrl: '/worker.js' }, vi.fn());
    });

    unmount();

    expect(live()).toHaveLength(0);
  });
});
