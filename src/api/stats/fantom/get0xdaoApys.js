import { SPOOKY_LPF } from '../../../constants';

const { getMasterChefApys } = require('../common/getMasterChefApys');
const { fantomWeb3 } = require('../../../utils/web3');
const pools = require('../../../data/fantom/0xdaoPools.json');
import { spookyClient } from '../../../apollo/client';

const get0xdaoApys = async () =>
  await getMasterChefApys({
    web3: fantomWeb3,
    chainId: 250,
    masterchef: '0xa7821C3e9fC1bF961e280510c471031120716c3d',
    tokenPerBlock: 'oxdPerSecond',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: '0xdao-wftm',
        poolId: 1,
        address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
        oracle: 'tokens',
        oracleId: 'WFTM',
        decimals: '1e18',
      },
      {
        name: '0xdao-weth',
        poolId: 2,
        address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        oracle: 'tokens',
        oracleId: 'WETH',
        decimals: '1e18',
      },
      {
        name: '0xdao-wbtc',
        poolId: 3,
        address: '0x321162Cd933E2Be498Cd2267a90534A804051b11',
        oracle: 'tokens',
        oracleId: 'WBTC',
        decimals: '1e8',
      },
      {
        name: '0xdao-usdc',
        poolId: 4,
        address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
        oracle: 'tokens',
        oracleId: 'USDC',
        decimals: '1e6',
      },
      {
        name: '0xdao-dai',
        poolId: 5,
        address: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
        oracle: 'tokens',
        oracleId: 'DAI',
        decimals: '1e18',
      },
      {
        name: '0xdao-mim',
        poolId: 6,
        address: '0x82f0B8B456c1A451378467398982d4834b6829c1',
        oracle: 'tokens',
        oracleId: 'MIM',
        decimals: '1e18',
      },
      {
        name: '0xdao-tomb',
        poolId: 12,
        address: '0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7',
        oracle: 'tokens',
        oracleId: 'TOMB',
        decimals: '1e18',
      },
      {
        name: '0xdao-oxd',
        poolId: 14,
        address: '0xc165d941481e68696f43EE6E99BFB2B23E0E3114',
        oracle: 'tokens',
        oracleId: 'OXD',
        decimals: '1e18',
      },
      {
        name: '0xdao-xboo',
        poolId: 7,
        address: '0xa48d959AE2E88f1dAA7D5F611E01908106dE7598',
        oracle: 'tokens',
        oracleId: 'xBOO',
        decimals: '1e18',
      },
      // TODO add xSCREAM and fBEETS prices
      // {
      //   name: '0xdao-xscream',
      //   poolId: 8,
      //   address: '0xe3D17C7e840ec140a7A51ACA351a482231760824',
      //   oracle: 'tokens',
      //   oracleId: 'xSCREAM',
      //   decimals: '1e18',
      // },
      // {
      //   name: '0xdao-fbeets',
      //   poolId: 13,
      //   address: '0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1',
      //   oracle: 'tokens',
      //   oracleId: 'fBEETS',
      //   decimals: '1e18',
      // },
    ],
    oracleId: 'OXD',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  });

module.exports = get0xdaoApys;
