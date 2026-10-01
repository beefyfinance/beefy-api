import * as fs from 'node:fs';
import * as path from 'node:path';
import { ChainId } from '@beefyfinance/blockchain-addressbook';

// TODO: the stats scaffolding is out of date
function addChain() {
  const chainName = process.argv[2];
  const chainId = process.argv[3];
  const rpc = process.argv[4];
  const explorer = process.argv[5];

  if (!chainName || !chainId || !rpc) {
    console.error('Please provide a chain name, chainId, and RPC as command-line arguments.');
    process.exit(1);
  }

  if (ChainId[chainName as keyof typeof ChainId] !== Number(chainId)) {
    console.error(`${chainName} with chainId ${chainId} is not in the address book, run add:chain:addressbook first.`);
    process.exit(1);
  }

  const statsPath = path.join(import.meta.dirname, '..', 'src', 'api', 'stats');
  const dataPath = path.join(import.meta.dirname, '..', 'src', 'data');

  /// create a new folder in data with the chain name
  const chainPath = path.join(dataPath, chainName);
  fs.mkdirSync(chainPath);

  const chainStatsPath = path.join(statsPath, chainName);
  fs.mkdirSync(chainStatsPath);

  const beefyCowVaultsFile = path.join(chainPath, 'beefyCowVaults.json');
  fs.writeFileSync(beefyCowVaultsFile, '[]');

  const chainIndexFile = path.join(chainStatsPath, 'index.js');
  const chainNameCapitalized = chainName.charAt(0).toUpperCase() + chainName.slice(1);
  fs.writeFileSync(
    chainIndexFile,
    `
        import { getBeefyCow${chainNameCapitalized}Apys } from './getBeefyCow${chainNameCapitalized}Apys.ts';

        const getApys = [getBeefyCow${chainNameCapitalized}Apys];

        const get${chainNameCapitalized}Apys = async () => {
        const start = Date.now();
        let apys = {};
        let apyBreakdowns = {};

        let promises = [];
        getApys.forEach(getApy => promises.push(getApy()));
        const results = await Promise.allSettled(promises);

        for (const result of results) {
            if (result.status !== 'fulfilled') {
            console.warn('get${chainNameCapitalized}Apys error', result.reason);
            continue;
            }

            // Set default APY values
            let mappedApyValues = result.value;
            let mappedApyBreakdownValues = {};

            // Loop through key values and move default breakdown format
            // To require totalApy key
            for (const [key, value] of Object.entries(result.value)) {
            mappedApyBreakdownValues[key] = {
                totalApy: value,
            };
            }

            // Break out to apy and breakdowns if possible
            let hasApyBreakdowns = 'apyBreakdowns' in result.value;
            if (hasApyBreakdowns) {
            mappedApyValues = result.value.apys;
            mappedApyBreakdownValues = result.value.apyBreakdowns;
            }

            apys = { ...apys, ...mappedApyValues };

            apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
        }

        const end = Date.now();
        console.log('> [APY] ${chainNameCapitalized} finished updating in '`
      + '`${(end - start) / 1000}s`'
      + `);

        return {
            apys,
            apyBreakdowns,
        };
        };

        export { get${chainNameCapitalized}Apys };
    `
  );

  // Add a stub chain config to src/config.ts
  const configPath = path.join(import.meta.dirname, '..', 'src', 'config.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  const configEntry = `  ${chainName}: {
    status: 'active',
    name: '${chainNameCapitalized}',
    rpcs: ['${rpc}'],
    explorer: { name: '${chainName} explorer', url: '${explorer ?? ''}' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
    },
  },`;
  const chainConfigsEndRegex = /\n} as const satisfies Partial<Record<AddressBookChain, ChainConfigInput>>\);/;

  if (new RegExp(`\\n  ${chainName}: \\{`).test(configContent)) {
    console.warn(`${chainName} already exists in src/config.ts`);
  } else if (chainConfigsEndRegex.test(configContent)) {
    configContent = configContent.replace(chainConfigsEndRegex, match => `\n${configEntry}${match}`);
    fs.writeFileSync(configPath, configContent);
    console.log(`Added ${chainName} to chainConfigs in src/config.ts`);
  } else {
    console.warn('chainConfigs not found in src/config.ts');
  }

  // Add the blocked tokens set to src/api/zap/swap/blocked-tokens.ts
  const blockedTokensPath = path.join(import.meta.dirname, '../src/api/zap/swap/blocked-tokens.ts');
  let blockedTokensContent = fs.readFileSync(blockedTokensPath, 'utf8');

  // Add the chain to the blocked tokens set
  const blockedTokensObjectRegex = /export const blockedTokensByChain: Record<ApiChain, Set<string>> = \{[\s\S]*?\};/;
  blockedTokensContent = blockedTokensContent.replace(blockedTokensObjectRegex, match => {
    return match.slice(0, -2) + `  ${chainName}: new Set([]),\n};`;
  });

  fs.writeFileSync(blockedTokensPath, blockedTokensContent);
  console.log(`Added ${chainName} to src/api/zap/swap/blocked-tokens.ts`);
}

Promise.resolve(addChain()).catch(console.error);
