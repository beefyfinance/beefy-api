import { getBifiGovApr } from '../common/getBifiGovApr';
import { CRONOS_CHAIN_ID } from '../../../constants';
import { addressBook } from '../../../../packages/address-book/address-book';
import { Hex } from 'viem';

const {
  cronos: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const SECONDS_PER_YEAR = 31536000;

export const getCronosBifiGovApy = async () => {
  return await getBifiGovApr(
    CRONOS_CHAIN_ID,
    'cronos',
    'WCRO',
    DECIMALS,
    rewardPool as Hex,
    oldBIFI.address as Hex,
    1,
    1,
    SECONDS_PER_YEAR
  );
};
