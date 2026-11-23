import { ApiPollerWorker, type ApiPollerWorkerOptions, type Msg } from 'api-poller-worker';
import { useEffect, useRef } from 'react';

/**
 * Poll an API in a web worker while the component is mounted, calling `onMessage` with what
 * changed after each response.
 *
 * The worker is created once, and created again only when `options` change. The callbacks can
 * change on every render without restarting it.
 */
export const useApiPollerWorker = <T extends object>(
  options: ApiPollerWorkerOptions,
  onMessage: (msg: Msg<T>) => void,
  onError?: (error: Error) => void,
) => {
  // Keep the latest callbacks, so the worker always calls the current ones.
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  });

  const { apiUrl, autoStart, fetchOptions, inline, interval, uniqueKey, worker, workerUrl } =
    options;
  // Compare fetch options by value, since they're usually a new object on every render.
  const fetchOptionsKey = fetchOptions === undefined ? undefined : JSON.stringify(fetchOptions);
  const workerUrlKey = workerUrl?.toString();

  useEffect(() => {
    const poller = new ApiPollerWorker<T>({
      apiUrl,
      autoStart,
      fetchOptions:
        fetchOptionsKey === undefined ? undefined : (JSON.parse(fetchOptionsKey) as RequestInit),
      inline,
      interval,
      uniqueKey,
      worker,
      workerUrl: workerUrlKey,
    });

    poller
      .onMessage((msg) => {
        onMessageRef.current(msg);
      })
      .onError((error) => {
        onErrorRef.current?.(error);
      });

    return () => {
      poller.terminate();
    };
  }, [apiUrl, autoStart, fetchOptionsKey, inline, interval, uniqueKey, worker, workerUrlKey]);
};
