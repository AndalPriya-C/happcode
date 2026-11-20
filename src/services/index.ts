import type { ExecutionService } from './execution';
import { httpExecutionService } from './httpExecutionService';
import { mockExecutionService } from '../mock/mockExecutionService';

// Real execution by default. Set VITE_EXECUTION_MODE=mock to work on the UI without the API.
export const executionService: ExecutionService =
  import.meta.env.VITE_EXECUTION_MODE === 'mock' ? mockExecutionService : httpExecutionService;
