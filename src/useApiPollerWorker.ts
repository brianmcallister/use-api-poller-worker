import { ApiPollerWorker, ApiPollerWorkerOptions, Msg } from '@brianmcallister/api-poller-worker';
import React from 'react';

export { Msg } from '@brianmcallister/api-poller-worker';

/**
 * Hook for subscribing to ApiPollerWorker.
 */
export default function useApiPollerWorker<T extends {}>(
  options: ApiPollerWorkerOptions,
  callback: (data: Msg<T>) => void,
) {
  React.useEffect(() => {
    const pollerWorker = new ApiPollerWorker<T>(options);

    pollerWorker.onMessage(callback);

    return () => {
      pollerWorker.stop();
    };
  }, [callback]);
}
