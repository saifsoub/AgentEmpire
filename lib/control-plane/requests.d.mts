export interface RequestInput { requestId: string; objective: string; workerId: string }
export interface RequestReceipt { requestId: string; commandHash: string; workerId: string; objective: string; state: string; observedAt: string; runMode: string; replayed: boolean; httpStatus?: number; note?: string }
export function authorize(header: string | null, key: string | undefined): void;
export function prepareRequest(input: unknown): Record<string, unknown>;
export function kernelEndpoint(value: string | undefined): string;
export class RequestLedger {
  constructor(directory: string);
  get(id: string): Promise<RequestReceipt | null>;
  submit(input: RequestInput, options: { endpoint: string | undefined; key: string | undefined; fetcher?: typeof fetch }): Promise<RequestReceipt>;
}
