import { ApiPollerWorker, ApiPollerWorkerOptions, Msg } from 'api-poller-worker';
import React from 'react';

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
