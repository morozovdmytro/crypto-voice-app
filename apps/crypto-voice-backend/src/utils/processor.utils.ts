import { ResultDataType } from '../types.js';

import { JobContext } from '@livekit/agents';
import { Processor } from '../abstractions/processor.js';
import { ResultDataProcessorMap } from '../types.js';

export const getProcessor = (
  type: ResultDataType,
  context: JobContext,
): Processor => {
  const processorConstructor = ResultDataProcessorMap[type];
  if (!processorConstructor) {
    throw new Error(`No processor found for type: ${type}`);
  }
  return new processorConstructor(context);
};
