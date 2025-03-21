import { ToolCallResult } from '../types.js';

export interface Processor {
  process(result?: ToolCallResult | null): Promise<void>;
}
