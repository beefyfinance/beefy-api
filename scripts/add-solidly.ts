import { ChainId } from '../packages/address-book/address-book';

import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';

import voterABI from '../src/abis/Voter.json';
import LPPairABI from '../src/abis/ISolidlyPair.json';
import ERC20ABI from '../src/abis/ERC20.json';
import { addressBook } from '../packages/address-book/address-book';
const {
  fantom: {
    platforms: { solidly },
  },
  optimism: {
    platforms: { velodrome },
  },
  polygon: {
    platforms: { dystopia },
  },
} = addressBook;

const projects = {
  solidly: {
    prefix: 'solidly',
    volatileFile: '../src/data/fantom/solidlyLpPools.json',
    voter: solidly.voter,
  },
  velodrome: {
    prefix: 'velodrome',
    stableFile: '../src/data/optimism/velodromeStableLpPools.json',
    volatileFile: '../src/data/optimism/velodromeLpPools.json',
    voter: velodrome.voter,
  },
  dystopia: {
    prefix: 'dystopia',
    stableFile: '../src/data/matic/dystopiaStableLpPools.json',
    volatileFile: '../src/data/matic/dystopiaLpPools.json',
    voter: dystopia.voter,
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
  lp: {
    type: 'string',
    demandOption: true,
    describe: 'provide the solidly LP for gauge',
  },
  newFee: {
    type: 'bool',
    demandOption: true,
    describe: 'If the beefy fee is 9.5% use true else use false',
  },
}).argv;

const poolPrefix = projects[args['project']].prefix;
const lpAddress = args['lp'];

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchGauge(lp) {
  console.log(`fetchGauge(${lp})`);
  const voterContract = new ethers.Contract(projects[args['project']].voter, voterABI, provider);
  const rewardsContract = await voterContract.gauges(lp);
  return {
    newGauge: rewardsContract,
  };
}

async function fetchLiquidityPair(lp) {
  console.log(`fetchLiquidityPair(${lp})`);
  const lpContract = new ethers.Contract(lp, LPPairABI, provider);
  const lpTokenContract = new ethers.Contract(lp, ERC20ABI, provider);
  return {
    address: ethers.utils.getAddress(lpAddress),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
    decimals: await lpTokenContract.decimals(),
    stable: await lpContract.stable(),
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
    logoURI: ``,
    website: '',
    description: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const farm = await fetchGauge(lpAddress);
  const lp = await fetchLiquidityPair(lpAddress);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const poolsJsonFile = lp.stable
    ? projects[args['project']].stableFile
    : projects[args['project']].volatileFile;
  const poolsJson = require(poolsJsonFile);

  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    gauge: farm.newGauge,
    decimals: `1e${lp.decimals}`,
    chainId: chainId,
    beefyFee: args['newFee'] ? 0.095 : 0.045,
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
