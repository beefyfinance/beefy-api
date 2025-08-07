import { ChainId } from '../packages/address-book/src/address-book';

import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import { ethers } from 'ethers';
import { MULTICHAIN_RPC } from '../src/constants';

import voterABI from '../src/abis/Voter.json';
import etherexVoterABI from '../src/abis/EtherexVoter.json';
import ERC20ABI from '../src/abis/ERC20.json';
import { addressBook } from '../packages/address-book/src/address-book';
import ISolidlyPair from '../src/abis/ISolidlyPair';
const {
  fantom: {
    platforms: { spiritswap, equalizer, fvm },
  },
  optimism: {
    platforms: { velodrome },
  },
  polygon: {
    platforms: { dystopia },
  },
  bsc: {
    platforms: { cone, thena },
  },
  ethereum: {
    platforms: { solidly },
  },
  arbitrum: {
    platforms: { solidlizard },
  },
  canto: {
    platforms: { cvm },
  },
  kava: {
    platforms: { equilibre },
  },
  zksync: {
    platforms: { velocore, vesync, dracula },
  },
  base: {
    platforms: { bvm, aerodrome, equalizer: scale },
  },
  linea: {
    platforms: { lynex, nile, etherex },
  },
  fraxtal: {
    platforms: { ra },
  },
  scroll: {
    platforms: { nuri, tokan },
  },
  sonic: {
    platforms: { equalizer: sonicEqualizer },
  },
  hyperevm: {
    platforms: { kittenswap },
  },
} = addressBook;

const projects = {
  equilibre: {
    prefix: 'equilibre',
    stableFile: '../src/data/kava/equilibreStableLpPools.json',
    volatileFile: '../src/data/kava/equilibreLpPools.json',
    voter: equilibre.voter,
  },
  velodrome: {
    prefix: 'velodrome-v2',
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
  cone: {
    prefix: 'cone',
    stableFile: '../src/data/coneStableLpPools.json',
    volatileFile: '../src/data/coneLpPools.json',
    voter: cone.voter,
  },
  thena: {
    prefix: 'thena',
    stableFile: '../src/data/bsc/thenaStableLpPools.json',
    volatileFile: '../src/data/bsc/thenaLpPools.json',
    voter: thena.voter,
  },
  spiritVolatile: {
    prefix: 'spiritV2',
    volatileFile: '../src/data/fantom/spiritVolatileLpPools.json',
    voter: spiritswap.volatileVoter,
  },
  spiritStable: {
    prefix: 'spiritV2',
    stableFile: '../src/data/fantom/spiritStableLpPools.json',
    voter: spiritswap.stableVoter,
  },
  equalizer: {
    prefix: 'equalizer',
    stableFile: '../src/data/fantom/equalizerV2StableLpPools.json',
    volatileFile: '../src/data/fantom/equalizerV2LpPools.json',
    voter: equalizer.voter,
  },
  fvm: {
    prefix: 'fvm',
    stableFile: '../src/data/fantom/fvmStableLpPools.json',
    volatileFile: '../src/data/fantom/fvmLpPools.json',
    voter: fvm.voter,
  },
  solidly: {
    prefix: 'monolith',
    stableFile: '../src/data/ethereum/solidlyStableLpPools.json',
    volatileFile: '../src/data/ethereum/solidlyLpPools.json',
    voter: solidly.voter,
  },
  cvm: {
    prefix: 'cvm',
    stableFile: '../src/data/canto/cvmStableLpPools.json',
    volatileFile: '../src/data/canto/cvmLpPools.json',
    voter: cvm.voter,
  },
  velocore: {
    prefix: 'velocore',
    stableFile: '../src/data/zksync/velocoreStableLpPools.json',
    volatileFile: '../src/data/zksync/velocoreLpPools.json',
    voter: velocore.voter,
  },
  vesync: {
    prefix: 'vesync',
    stableFile: '../src/data/zksync/veSyncStableLpPools.json',
    volatileFile: '../src/data/zksync/veSyncLpPools.json',
    voter: vesync.voter,
  },
  dracula: {
    prefix: 'dracula',
    stableFile: '../src/data/zksync/draculaStableLpPools.json',
    volatileFile: '../src/data/zksync/draculaLpPools.json',
    voter: dracula.voter,
  },
  bvm: {
    prefix: 'bvm',
    stableFile: '../src/data/base/bvmStableLpPools.json',
    volatileFile: '../src/data/base/bvmLpPools.json',
    voter: bvm.voter,
  },
  aerodrome: {
    prefix: 'aerodrome',
    stableFile: '../src/data/base/aerodromeStableLpPools.json',
    volatileFile: '../src/data/base/aerodromeLpPools.json',
    voter: aerodrome.voter,
  },
  equalizerBase: {
    prefix: 'equalizer-base',
    stableFile: '../src/data/base/equalizerStableLpPools.json',
    volatileFile: '../src/data/base/equalizerLpPools.json',
    voter: scale.voter,
  },
  lynex: {
    prefix: 'lynex',
    stableFile: '../src/data/linea/lynexStablePools.json',
    volatileFile: '../src/data/linea/lynexVolatilePools.json',
    voter: lynex.voter,
  },
  nile: {
    prefix: 'nile',
    stableFile: '../src/data/linea/nileStablePools.json',
    volatileFile: '../src/data/linea/nileVolatilePools.json',
    voter: nile.voter,
  },
  ra: {
    prefix: 'ra',
    stableFile: '../src/data/fraxtal/raStablePools.json',
    volatileFile: '../src/data/fraxtal/raPools.json',
    voter: ra.voter,
  },
  nuri: {
    prefix: 'nuri',
    stableFile: '../src/data/scroll/nuriStablePools.json',
    volatileFile: '../src/data/scroll/nuriVolatilePools.json',
    voter: nuri.voter,
  },
  tokan: {
    prefix: 'tokan',
    stableFile: '../src/data/scroll/tokanStablePools.json',
    volatileFile: '../src/data/scroll/tokanVolatilePools.json',
    voter: tokan.voter,
  },
  sonicEqualizer: {
    prefix: 'equalizer-sonic',
    stableFile: '../src/data/sonic/equalizerStableLpPools.json',
    volatileFile: '../src/data/sonic/equalizerLpPools.json',
    voter: sonicEqualizer.voter,
  },
  kittenswap: {
    prefix: 'kittenswap',
    stableFile: '../src/data/hyperevm/kittenswapStablePools.json',
    volatileFile: '../src/data/hyperevm/kittenswapLpPools.json',
    voter: kittenswap.voter,
  },
  etherex: {
    prefix: 'etherex',
    stableFile: '../src/data/linea/etherexStablePools.json',
    volatileFile: '../src/data/linea/etherexVolatilePools.json',
    voter: etherex.voter,
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
    type: 'boolean',
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
  if (projects[args['project']] === projects['etherex']) {
    const voterContract = new ethers.Contract(projects['etherex'].voter, etherexVoterABI, provider);
    const rewardsContract = await voterContract.gaugeForPool(lp);
    return {
      newGauge: rewardsContract,
    };
  } else {
    const voterContract = new ethers.Contract(projects[args['project']].voter, voterABI, provider);
    const rewardsContract = await voterContract.gauges(lp);
    return {
      newGauge: rewardsContract,
    };
  }
}

async function fetchLiquidityPair(lp) {
  console.log(`fetchLiquidityPair(${lp})`);
  const lpContract = new ethers.Contract(lp, ISolidlyPair as any, provider);
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
    documentation: '',
    bridge: '',
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

  fs.writeFileSync(path.resolve(__dirname, poolsJsonFile), JSON.stringify(newPools, null, 2) + '\n');

  console.log(newPool);
}

main();
