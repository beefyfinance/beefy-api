import { getBifiGovApr } from '../common/getBifiGovApr';
import { CRONOS_CHAIN_ID } from '../../../constants';

const BIFI = '0xe6801928061CDbE32AC5AD0634427E140EFd05F9';
const REWARDS = '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const SECONDS_PER_YEAR = 31536000;

export const getCronosBifiGovApy = async () => {
  return await getBifiGovApr(
    CRONOS_CHAIN_ID,
    'cronos',
    'WCRO',
    DECIMALS,
    REWARDS,
    BIFI,
    1,
    1,
    SECONDS_PER_YEAR
  );
};
