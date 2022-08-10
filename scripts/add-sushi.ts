import { ChainId } from '../packages/address-book/address-book';
import { sushi } from '../packages/address-book/address-book/one/platforms/sushi';
import { addressBook } from '../packages/address-book/address-book';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';

import masterchefABI from '../src/abis/matic/SushiMiniChefV2.json';
import LPPairABI from '../src/abis/LPPair.json';
import ERC20ABI from '../src/abis/ERC20.json';

const {
  polygon: {
    platforms: { sushi: sushiPolygon },
  },
  avax: {
    platforms: { pangolin: pangolin },
  },
  fantom: {
    platforms: { sushiFtm: sushiFtm },
  },
  fuse: {
    platforms: { sushiFuse: sushiFuse },
  },
  aurora: {
    platforms: { trisolaris: tri },
  },
  sys: {
    platforms: { pegasys: pegasys },
  },
} = addressBook;

const projects = {
  sushiOne: {
    prefix: 'sushi-one',
    file: '../src/data/one/sushiLpPools.json',
    masterchef: sushi.minichef,
  },
  sushiArb: {
    prefix: 'sushi-arb',
    file: '../src/data/arbitrum/sushiLpPools.json',
    masterchef: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
  },
  sushiCelo: {
    prefix: 'sushi-celo',
    file: '../src/data/celo/sushiv2LpPools.json',
    masterchef: '0x8084936982D089130e001b470eDf58faCA445008',
  },
  sushiPoly: {
    prefix: 'sushi',
    file: '../src/data/matic/sushiLpPools.json',
    masterchef: sushiPolygon.minichef,
  },
  pangolin: {
    prefix: 'png',
    file: '../src/data/avax/pangolinv2LpPools.json',
    masterchef: pangolin.minichef,
  },
  sushiFtm: {
    prefix: 'sushi',
    file: '../src/data/fantom/sushiFtmLpPools.json',
    masterchef: sushiFtm.minichef,
  },
  sushiFuse: {
    prefix: 'sushi',
    file: '../src/data/fuse/sushiFuseLpPools.json',
    masterchef: sushiFuse.minichef,
  },
  tri: {
    prefix: 'tri',
    file: '../src/data/aurora/trisolarisMiniLpPools.json',
    masterchef: tri.minichef,
  },
  pegasys: {
    prefix: 'pegasys',
    file: '../src/data/sys/pegasysLpPools.json',
    masterchef: pegasys.minichef,
  },
  pancake: {
    prefix: 'cakev2',
    file: '../src/data/cakeLpPoolsV2.json',
    masterchef: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
  },
};

const args = yargs.options({
  network: {
    type: 'string',
    demandOption: true,
    describe: 'blockchain network',
    choices: Object.keys(ChainId),
  },
  project: {
    type: 'string',
    demandOption: true,
    describe: 'project name',
    choices: Object.keys(projects),
  },
  pool: {
    type: 'interger',
    demandOption: true,
    describe: 'poolId from respective masterchef contract',
  },
  newFee: {
    type: 'bool',
    demandOption: true,
    describe: 'If the beefy fee is 9.5% use true else use false',
  },
}).argv;

const poolPrefix = projects[args['project']].prefix;
const poolId = args['pool'];
const masterchef = projects[args['project']].masterchef;
const poolsJsonFile = projects[args['project']].file;
const poolsJson = require(poolsJsonFile);

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchFarm(masterchefAddress, poolId) {
  console.log(`fetchFarm(${masterchefAddress}, ${poolId})`);
  const masterchefContract = new ethers.Contract(masterchefAddress, masterchefABI, provider);
  const lpToken = await masterchefContract.lpToken(poolId);
  return lpToken;
}

async function fetchLiquidityPair(lpAddress) {
  console.log(`fetchLiquidityPair(${lpAddress})`);
  const lpContract = new ethers.Contract(lpAddress, LPPairABI, provider);
  const lpTokenContract = new ethers.Contract(lpAddress, ERC20ABI, provider);
  return {
    address: ethers.utils.getAddress(lpAddress),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
    decimals: await lpTokenContract.decimals(),
  };
}

async function fetchToken(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const checksummedTokenAddress = ethers.utils.getAddress(tokenAddress);
  const token = {
    name: await tokenContract.name(),
    symbol: await tokenContract.symbol(),
    address: checksummedTokenAddress,
    chainId: chainId,
    decimals: await tokenContract.decimals(),
    logoURI: `https://tokens.pancakeswap.finance/images/${checksummedTokenAddress}.svg`,
    website: '',
    description: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const farm = await fetchFarm(masterchef, poolId);
  const lp = await fetchLiquidityPair(farm);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    decimals: `1e${lp.decimals}`,
    beefyFee: args['newFee'] ? 0.095 : 0.045,
    poolId: poolId,
    chainId: chainId,
    lp0: {
      address: token0.address,
      oracle: 'tokens',
      oracleId: token0.symbol,
      decimals: `1e${token0.decimals}`,
    },
    lp1: {
      address: token1.address,
      oracle: 'tokens',
      oracleId: token1.symbol,
      decimals: `1e${token1.decimals}`,
    },
  };

  poolsJson.forEach(pool => {
    if (pool.name === newPoolName) {
      throw Error(`Duplicate: pool with name ${newPoolName} already exists`);
    }
  });

  const newPools = [newPool, ...poolsJson];

  fs.writeFileSync(
    path.resolve(__dirname, poolsJsonFile),
    JSON.stringify(newPools, null, 2) + '\n'
  );

  console.log(newPool);
}

main();
