import {
  WorkerToPoolMessageStatus,
  type PoolToWorkerMessage,
  type WorkerToPoolMessage,
} from '../../../src/internals/worker-pool/IWorkerPool.js';
import { jest } from '@jest/globals';

jest.unstable_mockModule('node:worker_threads', () => ({
  Worker: jest.fn(),
}));

const { BasicPool } = await import('../../../src/internals/worker-pool/BasicPool.js');
const WorkerThreadsMock = await import('node:worker_threads');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('BasicPool', () => {
  it('should instantly register handlers when spawning workers', () => {
    // Arrange
    const { Worker, on, postMessage } = mockWorker();
    const workerFileUrl = new URL('file:///worker.cjs');
    const pool = new BasicPool(workerFileUrl);

    // Act
    pool.spawnNewWorker();

    // Assert
    expect(Worker).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenCalledWith(workerFileUrl, { workerData: { fastcheckWorker: true } });
    expect(on).toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  });

  describe('ready worker', () => {
    it('should spawn workers marked as available and not faulty', async () => {
      // Arrange
      const { on } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const pool = new BasicPool(workerFileUrl);

      // Act
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;

      // Assert
      expect(worker.isAvailable()).toBe(true);
      expect(worker.isFaulty()).toBe(false);
    });

    it('should mark the worker as not available but not faulty while waiting answers', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;

      // Act
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Assert
      expect(worker.isAvailable()).toBe(false);
      expect(worker.isFaulty()).toBe(false);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should call success handler and release the worker as soon as receiving a successful answer', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const successMessage = 'success!';
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const receivedMessage: PoolToWorkerMessage<string> = postMessage.mock.calls[0][0];
      const receivedRunId = receivedMessage.runId;
      const message: WorkerToPoolMessage<string> = {
        runId: receivedRunId,
        status: WorkerToPoolMessageStatus.Success,
        output: successMessage,
      };
      const onMessageHandler = on.mock.calls.find(([eventName]) => eventName === 'message')![1];
      onMessageHandler(message); // emulate success

      // Assert
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(successMessage);
      expect(worker.isAvailable()).toBe(true);
      expect(worker.isFaulty()).toBe(false);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should call failure handler and release the worker as soon as receiving a failed answer', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const errorMessage = 'oups there was an error!';
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const receivedMessage: PoolToWorkerMessage<string> = postMessage.mock.calls[0][0];
      const receivedRunId = receivedMessage.runId;
      const message: WorkerToPoolMessage<string> = {
        runId: receivedRunId,
        status: WorkerToPoolMessageStatus.Failure,
        error: errorMessage,
      };
      const onMessageHandler = on.mock.calls.find(([eventName]) => eventName === 'message')![1];
      onMessageHandler(message); // emulate failure

      // Assert
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(onFailure).toHaveBeenCalledWith(errorMessage);
      expect(worker.isAvailable()).toBe(true);
      expect(worker.isFaulty()).toBe(false);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should call skipped handler and release the worker as soon as receiving a skipped answer', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const receivedMessage: PoolToWorkerMessage<string> = postMessage.mock.calls[0][0];
      const receivedRunId = receivedMessage.runId;
      const message: WorkerToPoolMessage<string> = {
        runId: receivedRunId,
        status: WorkerToPoolMessageStatus.Skipped,
      };
      const onMessageHandler = on.mock.calls.find(([eventName]) => eventName === 'message')![1];
      onMessageHandler(message); // emulate failure

      // Assert
      expect(onSkipped).toHaveBeenCalledTimes(1);
      expect(worker.isAvailable()).toBe(true);
      expect(worker.isFaulty()).toBe(false);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
    });

    it('should ignore success or failures not related to the current run', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const receivedMessage: PoolToWorkerMessage<string> = postMessage.mock.calls[0][0];
      const receivedRunId = receivedMessage.runId;
      const message1: WorkerToPoolMessage<string> = {
        runId: receivedRunId - 1,
        status: WorkerToPoolMessageStatus.Success,
        output: 'm1',
      };
      const message2: WorkerToPoolMessage<string> = {
        runId: receivedRunId + 1,
        status: WorkerToPoolMessageStatus.Success,
        output: 'm2',
      };
      const message3: WorkerToPoolMessage<string> = {
        runId: receivedRunId + 1,
        status: WorkerToPoolMessageStatus.Failure,
        error: 'm3',
      };
      const onMessageHandler = on.mock.calls.find(([eventName]) => eventName === 'message')![1];
      onMessageHandler(message1);
      onMessageHandler(message2);
      onMessageHandler(message3);

      // Assert
      expect(worker.isAvailable()).toBe(false); // still waiting messages for 'receivedRunId'
      expect(worker.isFaulty()).toBe(false);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should call failure handler and mark the worker as faulty when receiving messageerror message', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const onErrorHandler = on.mock.calls.find(([eventName]) => eventName === 'messageerror')![1];
      onErrorHandler(new Error('failed to serialize/deserialize payload!')); // emulate messageerror message

      // Assert
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(worker.isAvailable()).toBe(true); // we can recover immediately from such problems
      expect(worker.isFaulty()).toBe(false);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should call failure handler and mark the worker as faulty when receiving error message', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const onErrorHandler = on.mock.calls.find(([eventName]) => eventName === 'error')![1];
      onErrorHandler(new Error('boom!')); // emulate error message

      // Assert
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(worker.isAvailable()).toBe(false); // we don't want to recover such worker
      expect(worker.isFaulty()).toBe(true);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should call failure handler and mark the worker as faulty when receiving exit message', async () => {
      // Arrange
      const { on, postMessage } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);

      // Act
      const exitCode = 101;
      const onExitHandler = on.mock.calls.find(([eventName]) => eventName === 'exit')![1];
      onExitHandler(exitCode); // emulate exit message

      // Assert
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(worker.isAvailable()).toBe(false); // we don't want to recover such worker
      expect(worker.isFaulty()).toBe(true);
      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });
  });

  describe('faulty worker', () => {
    it('should throw when spawning worker if messageerror received before online', async () => {
      // Arrange
      const { on } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();

      // Act
      const onExitHandler = on.mock.calls.find(([eventName]) => eventName === 'messageerror')![1];
      onExitHandler(new Error('Failure in serialization or deserialization')); // emulate messageerror message

      // Assert
      await expect(workerPromise).rejects.toThrowError();
    });

    it('should throw when spawning worker if error received before online', async () => {
      // Arrange
      const { on } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();

      // Act
      const onExitHandler = on.mock.calls.find(([eventName]) => eventName === 'error')![1];
      onExitHandler(new Error('An error')); // emulate error message

      // Assert
      await expect(workerPromise).rejects.toThrowError();
    });

    it('should throw when spawning worker if exit received before online', async () => {
      // Arrange
      const { on } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();

      // Act
      const exitCode = 101;
      const onExitHandler = on.mock.calls.find(([eventName]) => eventName === 'exit')![1];
      onExitHandler(exitCode); // emulate exit message

      // Assert
      await expect(workerPromise).rejects.toThrowError();
    });
  });

  describe('timeout-ed worker', () => {
    it('should not alter a never started worker', async () => {
      // Arrange
      const { on, terminate } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;

      // Act
      await worker.terminateIfStillRunning();

      // Assert
      expect(terminate).not.toHaveBeenCalled(); // not terminated, was stop running
      expect(worker.isAvailable()).toBe(true); // still available
      expect(worker.isFaulty()).toBe(false); // still not faulty
      expect(pool.getFirstAvailableWorker()).toBe(worker); // in the pool
    });

    it('should not alter a worker that successfully ended', async () => {
      // Arrange
      const { on, postMessage, terminate } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);
      const receivedMessage: PoolToWorkerMessage<string> = postMessage.mock.calls[0][0];
      const receivedRunId = receivedMessage.runId;
      const message: WorkerToPoolMessage<string> = {
        runId: receivedRunId,
        status: WorkerToPoolMessageStatus.Success,
        output: 'successMessage',
      };
      const onMessageHandler = on.mock.calls.find(([eventName]) => eventName === 'message')![1];
      onMessageHandler(message); // emulate success

      // Act
      await worker.terminateIfStillRunning();

      // Assert
      expect(terminate).not.toHaveBeenCalled(); // not terminated, was stop running
      expect(worker.isAvailable()).toBe(true); // still available
      expect(worker.isFaulty()).toBe(false); // still not faulty
      expect(pool.getFirstAvailableWorker()).toBe(worker); // in the pool
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should not alter a worker that rejected', async () => {
      // Arrange
      const { on, postMessage, terminate } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);
      const receivedMessage: PoolToWorkerMessage<string> = postMessage.mock.calls[0][0];
      const receivedRunId = receivedMessage.runId;
      const message: WorkerToPoolMessage<string> = {
        runId: receivedRunId,
        status: WorkerToPoolMessageStatus.Failure,
        error: 'errorMessage',
      };
      const onMessageHandler = on.mock.calls.find(([eventName]) => eventName === 'message')![1];
      onMessageHandler(message); // emulate failure

      // Act
      await worker.terminateIfStillRunning();

      // Assert
      expect(terminate).not.toHaveBeenCalled(); // not terminated, was stop running
      expect(worker.isAvailable()).toBe(true); // still available
      expect(worker.isFaulty()).toBe(false); // still not faulty
      expect(pool.getFirstAvailableWorker()).toBe(worker); // in the pool
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(onSkipped).not.toHaveBeenCalled();
    });

    it('should stop a registered worker still being running', async () => {
      // Arrange
      const { on, terminate } = mockWorker();
      const workerFileUrl = new URL('file:///worker.cjs');
      const predicateId = 0;
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      const onSkipped = jest.fn();
      const pool = new BasicPool<string, string>(workerFileUrl);
      const workerPromise = pool.spawnNewWorker();
      fireOnlineEvent(on);
      const worker = await workerPromise;
      worker.register(predicateId, 'to-worker', onSuccess, onFailure, onSkipped);
      expect(terminate).not.toHaveBeenCalled();

      // Act
      await worker.terminateIfStillRunning();

      // Assert
      expect(terminate).toHaveBeenCalledTimes(1);
      expect(worker.isAvailable()).toBe(false); // not available as we mark the worker as not being ready
      expect(worker.isFaulty()).toBe(false); // no impact on faulty state
      expect(pool.getFirstAvailableWorker()).toBe(undefined); // no worker available
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSkipped).not.toHaveBeenCalled();
    });
  });
});

// Helpers

function mockWorker() {
  const Worker = WorkerThreadsMock.Worker as jest.Mocked<typeof WorkerThreadsMock.Worker>;
  const on = jest.fn<typeof WorkerThreadsMock.Worker.prototype.on>();
  const postMessage = jest.fn<typeof WorkerThreadsMock.Worker.prototype.postMessage>();
  const terminate = jest.fn<typeof WorkerThreadsMock.Worker.prototype.terminate>();
  Worker.mockImplementation(
    () =>
      ({
        on,
        postMessage,
        terminate,
      }) as any,
  );
  return { Worker, on, postMessage, terminate };
}

function fireOnlineEvent(on: jest.Mock<typeof WorkerThreadsMock.Worker.prototype.on>) {
  const onOnlineHandler = on.mock.calls.find(([eventName]) => eventName === 'online')![1];
  onOnlineHandler();
}
