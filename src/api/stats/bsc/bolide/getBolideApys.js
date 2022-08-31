const { bscWeb3: web3 } = require('../../../../utils/web3');
import { BSC_CHAIN_ID, PCS_LPF } from '../../../../constants';
import { getMasterChefApys } from '../../common/getMasterChefApys';

const pools = require('../../../../data/bolideLpPools.json');
const MasterChef = require('../../../../abis/BlidMasterChef.json');
const { cakeClient } = require('../../../../apollo/client');

const getBolideApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: BSC_CHAIN_ID,
    masterchef: '0x3782C47E62b13d579fe748946AEf7142B45B2cf7',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'blidPerBlock',
    allocPointIndex: '1',
    pools: pools,
    oracleId: 'BLID',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: PCS_LPF,
  });

module.exports = getBolideApys;
