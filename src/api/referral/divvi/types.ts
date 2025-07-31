import { Hash } from 'viem';

export enum SubmitStatus {
  SUBMITTED = 'submitted',
  CLIENT_ERROR = 'client-error',
  SERVER_ERROR = 'server-error',
}

export type DivviSubmitRequest = {
  chainId: number;
  hash: Hash;
};

export interface IDivviApi {
  submit(chainId: number, txHash: Hash): Promise<SubmitStatus>;
}
