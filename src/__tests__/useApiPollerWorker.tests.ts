// @ts-ignore
global.self = global;

/* eslint-disable import/first */
import { renderHook } from '@testing-library/react-hooks';
import { ApiPollerWorker } from '@brianmcallister/api-poller-worker';

import useApiPollerWorker from '../useApiPollerWorker';
/* eslint-enable import/first */

jest.mock('@brianmcallister/api-poller-worker', () => ({
  ApiPollerWorker: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    onMessage: jest.fn(),
  })),
}));

describe('useApiPollerWorker', () => {
  it('should create an ApiPollerWorker ', () => {
    const callback = jest.fn();

    const result = renderHook(() => useApiPollerWorker({ workerUrl: 'test' }, callback));

    expect(ApiPollerWorker).toHaveBeenCalledWith({ workerUrl: 'test' });

    // @ts-ignore
    expect(ApiPollerWorker.mock.results[0].value.onMessage).toHaveBeenCalledWith(callback);

    result.unmount();

    // @ts-ignore
    expect(ApiPollerWorker.mock.results[0].value.stop).toHaveBeenCalled();
  });
});
