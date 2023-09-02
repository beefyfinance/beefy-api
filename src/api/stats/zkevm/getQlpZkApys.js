import { ZKEVM_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/zkevm/qlpPools.json';
import trackers from '../../../data/zkevm/qlpTrackers.json';
import { getGmxCommonApys } from '../common/gmx/getGmxApys';
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  tokens: { WETH, USDC, QUICK },
} = addressBook.zkevm;

export const getQlpZkApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    rewards: [WETH, USDC, QUICK],
    chainId,
  });
