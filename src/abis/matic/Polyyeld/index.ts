import { AbiItem } from 'web3-utils';
import _PolyyeldMasterChef_ABI from './L1/PolyyeldMasterChef.json';
import _xYeldMasterChef_ABI from './L2/xYeldMasterChef.json';
import {
  ContractContext as PolyyeldMasterChef,
  PolyyeldMasterChefMethodNames,
} from './L1/types/PolyyeldMasterChef';
import {
  ContractContext as xYeldMasterChef,
  XYeldMasterChefMethodNames as xYeldMasterChefMethodNames,
} from './L2/types/xYeldMasterChef';

const PolyyeldMasterChef_ABI = _PolyyeldMasterChef_ABI as unknown as AbiItem[];
const xYeldMasterChef_ABI = _xYeldMasterChef_ABI as unknown as AbiItem[];
export {
  PolyyeldMasterChef,
  PolyyeldMasterChef_ABI,
  PolyyeldMasterChefMethodNames,
  xYeldMasterChef,
  xYeldMasterChef_ABI,
  xYeldMasterChefMethodNames,
};
