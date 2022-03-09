import { FileHandle, mkdir, open } from 'fs/promises';
import { dirname } from 'path';
import { Operation, ensure } from 'effection';

export interface ProcessLog {
  out(data: string): Operation<void>;
  err(data: string): Operation<void>;
}

export interface ProcessLogOptions {
  name?: string;
  path: string;
}

export function createProcessLog({ name, path }: ProcessLogOptions): Operation<ProcessLog> {
  const outFilename = `${path}.out.log`;
  const errFilename = `${path}.err.log`;

  return {
    name: name ?? 'Process Log',
    labels: { path, out: outFilename, err: errFilename, expand: false },
    *init() {
      yield mkdir(dirname(path), { recursive: true });
      const out: FileHandle = yield open(outFilename, 'w');
      yield ensure(() => out.close());

      const err: FileHandle = yield open(errFilename, 'w');
      yield ensure(() => err.close());

      return {
        out: data => out.write(data).then(() => undefined),
        err: data => err.write(data).then(() => undefined),
      };
    },
  };
}

export function createTestLog(): Operation<ProcessLog> {
  const test = expect.getState().currentTestName;
  return createProcessLog({
    name: 'Test Log',
    path: `logs/${filenamify(test)}`,
  });
}

function filenamify(unsafe: string): string {
  return unsafe.replace(/\s/g, '-');
}
