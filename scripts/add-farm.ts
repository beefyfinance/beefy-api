import { ChainId, addressBook } from '../packages/address-book/address-book';
const {
  fantom: {
    platforms: { spookyswap },
  },
  moonriver: {
    platforms: { finn, solarbeam },
  },
  aurora: {
    platforms: { trisolaris },
  },
  bsc: {
    platforms: { biswap },
  },
  metis: {
    platforms: { netswap, tethys },
  },
  avax: {
    platforms: { joe },
  },
  moonbeam: {
    platforms: { stellaswap, beamswap, solarflare },
  },
  emerald: {
    platforms: { yuzu },
  },
} = addressBook;

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../src/constants');

const masterchefABI = require('../src/abis/MasterChef.json');
const LPPairABI = require('../src/abis/LPPair.json');
const ERC20ABI = require('../src/abis/ERC20.json');

const projects = {
  pancake: {
    prefix: 'cakev2',
    file: '../src/data/cakeLpPools.json',
    masterchef: '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
  },
  wault: {
    prefix: 'wex',
    file: '../src/data/waultLpPools.json',
    masterchef: '0x22fB2663C7ca71Adc2cc99481C77Aaf21E152e2D',
  },
  mdex: {
    prefix: 'mdex-bsc',
    file: '../src/data/mdexBscLpPools.json',
    masterchef: '0xc48FE252Aa631017dF253578B1405ea399728A50',
  },
  ape: {
    prefix: 'banana',
    file: '../src/data/degens/apeLpPools.json',
    masterchef: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
  },
  joe: {
    prefix: 'joe',
    file: '../src/data/avax/joeDualLpPools.json',
    masterchef: joe.masterchefV3,
  },
  boostedjoe: {
    prefix: 'joe',
    file: '../src/data/avax/joeBoostedLpPools.json',
    masterchef: joe.boostedMasterChef,
  },
  spooky: {
    prefix: 'boo',
    file: '../src/data/fantom/spookyLpPools.json',
    masterchef: spookyswap.masterchef,
  },
  solarbeam: {
    prefix: 'solarbeam',
    file: '../src/data/moonriver/solarbeamDualLpPools.json',
    masterchef: solarbeam.masterchefV2,
  },
  trisolaris: {
    prefix: 'trisolaris',
    file: '../src/data/aurora/trisolarisLpPools.json',
    masterchef: trisolaris.masterchef,
  },
  biswap: {
    prefix: 'biswap',
    file: '../src/data/biswapLpPools.json',
    masterchef: biswap.masterchef,
  },
  netswap: {
    prefix: 'netswap',
    file: '../src/data/metis/netswapLpPools.json',
    masterchef: netswap.masterchef,
  },
  tethys: {
    prefix: 'tethys',
    file: '../src/data/metis/tethysLpPools.json',
    masterchef: tethys.masterchef,
  },
  finn: {
    prefix: 'finn',
    file: '../src/data/moonriver/finnLpPools.json',
    masterchef: finn.masterchef,
  },
  beamswap: {
    prefix: 'beamswap',
    file: '../src/data/moonbeam/beamswapLpPools.json',
    masterchef: beamswap.masterchef,
  },
  solarflare: {
    prefix: 'solarflare',
    file: '../src/data/moonbeam/solarFlareLpPools.json',
    masterchef: solarflare.masterchef,
  },
  stellaswap: {
    prefix: 'stellaswap',
    file: '../src/data/moonbeam/stellaswapLpV2Pools.json',
    masterchef: stellaswap.masterchefV1distributorV2,
  },
  yuzu: {
    prefix: 'yuzu',
    file: '../src/data/emerald/yuzuLpPools.json',
    masterchef: yuzu.masterchef,
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
    type: 'integer',
    demandOption: true,
    describe: 'poolId from respective masterchef contract',
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
  const poolInfo = await masterchefContract.poolInfo(poolId);
  return {
    lpToken: poolInfo.lpToken,
    allocPoint: poolInfo.allocPoint,
    lastRewardBlock: poolInfo.lastRewardBlock,
    accCakePerShare: poolInfo.accCakePerShare,
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
    logoURI: `https://tokens.pancakeswap.finance/images/${checksummedTokenAddress}.svg`,
    website: '',
    description: '',
  };
  console.log({ [token.symbol]: token }); // Prepare token data for address-book
  return token;
}

async function main() {
  const farm = await fetchFarm(masterchef, poolId);
  const lp = await fetchLiquidityPair(farm.lpToken);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);

  const newPoolName = `${poolPrefix}-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;
  const newPool = {
    name: newPoolName,
    address: lp.address,
    decimals: `1e${lp.decimals}`,
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
