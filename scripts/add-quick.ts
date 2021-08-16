import { ChainId } from '../packages/address-book/address-book';

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../src/constants');

const rewardPoolABI = require('../src/abis/IStakingRewards.json');
const LPPairABI = require('../src/abis/LPPair.json');
const ERC20ABI = require('../src/abis/ERC20.json');

const projects = {
  quick: {
    prefix: 'quick',
    file: '../src/data/matic/quickLpPools.json',
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
    type: 'string',
    demandOption: true,
    describe: 'reward pool for the designated want',
  },
}).argv;

const poolPrefix = projects[args['project']].prefix;
const rewardPool = args['pool'];
const poolsJsonFile = projects[args['project']].file;
const poolsJson = require(poolsJsonFile);

const chainId = ChainId[args['network']];
const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[chainId]);

async function fetchRewardPool(rewardPool) {
  console.log(`fetchRewardPool(${rewardPool})`);
  const rewardPoolContract = new ethers.Contract(rewardPool, rewardPoolABI, provider);
  const stakingToken = await rewardPoolContract.stakingToken();
  return {
    lpToken: stakingToken,
  };
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
    logoURI: ``,
    website: '',
    description: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const farm = await fetchRewardPool(rewardPool);
  const lp = await fetchLiquidityPair(farm.lpToken);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    rewardPool: rewardPool,
    decimals: `1e${lp.decimals}`,
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
