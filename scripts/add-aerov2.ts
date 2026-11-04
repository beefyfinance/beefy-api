import fs from 'node:fs';
import path from 'node:path';
import {
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  createPublicClient,
  getAddress,
  http,
  parseAbi,
  zeroAddress,
} from 'viem';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { MULTICHAIN_RPC } from '../src/api/rpc/rpcs.ts';
import { isApiChain, SupportedChains, toChainId } from '../src/utils/chain.ts';

const abi = parseAbi([
  'function strategy() view returns (address)',
  'function want() view returns (address)',
  'function factory() view returns (address)',
  'function factoryRegistry() view returns (address)',
  'function targetToGauge(address) view returns (address)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]);

const args = yargs(hideBin(process.argv))
  .command('$0 <network> <address>', 'Add an Aero V2 pool', command =>
    command
      .positional('network', {
        type: 'string',
        choices: SupportedChains,
        demandOption: true,
        describe: 'Blockchain network',
      })
      .positional('address', { type: 'string', demandOption: true, describe: 'Strategy, vault, or pool address' })
  )
  .strict()
  .parseSync();

async function main() {
  const { network, address } = args;
  if (typeof network !== 'string' || !isApiChain(network) || typeof address !== 'string') {
    throw new Error('Provide a supported network and a strategy, vault, or pool address');
  }
  const chainId = toChainId(network);
  const rpc = MULTICHAIN_RPC[chainId];
  if (!rpc) throw new Error(`No RPC configured for ${args.network}`);
  const client = createPublicClient({ transport: http(rpc) });
  const input = getAddress(address);
  const probe = async (address: `0x${string}`, functionName: 'want' | 'strategy') => {
    try {
      return await client.readContract({ address, abi, functionName });
    } catch (error) {
      if (
        error instanceof BaseError
        && error.walk(
          err => err instanceof ContractFunctionRevertedError || err instanceof ContractFunctionZeroDataError
        )
      ) {
        return undefined;
      }
      throw error;
    }
  };
  // Try strategy first, then vault, and finally treat the input as a pool.
  const want = await probe(input, 'want');
  const strategy = want ? undefined : await probe(input, 'strategy');
  const resolvedPool =
    want
    ?? (strategy && strategy !== zeroAddress ? await probe(strategy, 'want') : undefined)
    ?? (strategy ? undefined : input);
  if (!resolvedPool || resolvedPool === zeroAddress) throw new Error(`No pool found for ${input}`);
  const pool = getAddress(resolvedPool);

  const [factory, token0, token1, decimals] = await Promise.all([
    client.readContract({ address: pool, abi, functionName: 'factory' }),
    client.readContract({ address: pool, abi, functionName: 'token0' }),
    client.readContract({ address: pool, abi, functionName: 'token1' }),
    client.readContract({ address: pool, abi, functionName: 'decimals' }),
  ]);
  const registry = await client.readContract({ address: factory, abi, functionName: 'factoryRegistry' });
  const gauge = await client.readContract({ address: registry, abi, functionName: 'targetToGauge', args: [pool] });
  if (gauge === zeroAddress) throw new Error(`No gauge found for pool ${pool}`);

  async function token(address: `0x${string}`) {
    const [symbol, tokenDecimals] = await Promise.all([
      client.readContract({ address, abi, functionName: 'symbol' }),
      client.readContract({ address, abi, functionName: 'decimals' }),
    ]);
    return { address: getAddress(address), oracle: 'tokens', oracleId: symbol, decimals: `1e${tokenDecimals}` };
  }
  const [lp0, lp1] = await Promise.all([token(token0), token(token1)]);
  const entry = {
    name: `aero-v2-${network}-${lp0.oracleId.toLowerCase()}-${lp1.oracleId.toLowerCase()}`,
    address: pool,
    gauge: getAddress(gauge),
    decimals: `1e${decimals}`,
    chainId,
    beefyFee: 0.095,
    lp0,
    lp1,
  };
  const file = path.resolve(import.meta.dirname, '../src/data', network, 'aeroLpPools.json');
  const pools: { name: string; address: string }[] = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : [];
  if (!Array.isArray(pools)) throw new Error(`${file} must contain an array`);
  if (pools.some(existing => existing.name === entry.name || existing.address.toLowerCase() === pool.toLowerCase())) {
    throw new Error(`Pool ${entry.name} (${pool}) already exists in ${file}`);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify([entry, ...pools], null, 2)}\n`);
  console.log(`Added to ${file}:`, entry);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
