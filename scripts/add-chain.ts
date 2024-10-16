import * as fs from 'fs';
import * as path from 'path';

function addChain() {
  const chainName = process.argv[2];
  const chainId = process.argv[3];
  const rpc = process.argv[4];
  const explorer = process.argv[5];
  const oracleId = process.argv[6];

  if (!chainName || !chainId || !rpc) {
    console.error('Please provide a chain name, chainId, and RPC as command-line arguments.');
    process.exit(1);
  }

  const statsPath = path.join(__dirname, '..', 'src', 'api', 'stats');
  const dataPath = path.join(__dirname, '..', 'src', 'data');

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
        const { getBeefyCow${chainNameCapitalized}Apys } = require('./getBeefyCow${chainNameCapitalized}Apys');

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
        console.log('> [APY] ${chainNameCapitalized} finished updating in '` +
      '`${(end - start) / 1000}s`' +
      `);

        return {
            apys,
            apyBreakdowns,
        };
        };

        module.exports = { get${chainNameCapitalized}Apys };
    `
  );

  // Add RPC endpoint to constants.ts
  const constantsPath = path.join(__dirname, '..', 'src', 'constants.ts');
  let constantsContent = fs.readFileSync(constantsPath, 'utf8');

  const rpcStatement = `const ${chainName.toUpperCase()}_RPC = process.env.${chainName.toUpperCase()}_RPC || '${rpc}';`;

  // Find the RPC Endpoints section
  const rpcEndpointsRegex = /\/\/\/ RPC Endpoints[\s\S]*?(?=\n\n)/;
  const rpcEndpointsMatch = constantsContent.match(rpcEndpointsRegex);

  if (rpcEndpointsMatch) {
    const updatedRpcEndpoints = rpcEndpointsMatch[0] + '\n' + rpcStatement;
    constantsContent = constantsContent.replace(rpcEndpointsRegex, updatedRpcEndpoints);
  } else {
    console.warn('RPC Endpoints section not found in constants.ts');
  }

  // Add Chain ID
  const chainIdStatement = `const ${chainName.toUpperCase()}_CHAIN_ID = ChainId.${chainName};`;
  const chainIdsRegex = /\/\/\/ Chain IDs[\s\S]*?(?=\n\n)/;
  const chainIdsMatch = constantsContent.match(chainIdsRegex);

  if (chainIdsMatch) {
    const updatedChainIds = chainIdsMatch[0] + '\n' + chainIdStatement;
    constantsContent = constantsContent.replace(chainIdsRegex, updatedChainIds);
  } else {
    console.warn('Chain IDs section not found in constants.ts');
  }

  // Add Vaults Endpoint
  const vaultsEndpointStatement = `const ${chainName.toUpperCase()}_VAULTS_ENDPOINT =
   'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/${chainName}.json';`;

  // Find the Vaults Endpoints section
  const vaultsEndpointsRegex = /\/\/ Beefy Vaults Endpoints[\s\S]*?(?=\n\n)/;
  const vaultsEndpointsMatch = constantsContent.match(vaultsEndpointsRegex);

  if (vaultsEndpointsMatch) {
    const updatedVaultsEndpoints = vaultsEndpointsMatch[0] + '\n' + vaultsEndpointStatement;
    constantsContent = constantsContent.replace(vaultsEndpointsRegex, updatedVaultsEndpoints);
  } else {
    console.warn('Vaults Endpoints section not found in constants.ts');
  }

  // Add to MULTICHAIN_ENDPOINTS object
  const multichainEndpointsRegex =
    /const MULTICHAIN_ENDPOINTS: Partial<Record<ApiChain, string>> = {[\s\S]*?} as const;/;
  constantsContent = constantsContent.replace(multichainEndpointsRegex, match => {
    return match.slice(0, -11) + `  ${chainName}: ${chainName.toUpperCase()}_VAULTS_ENDPOINT,\n} as const;`;
  });

  // Update exports
  const exportsRegex = /export {[\s\S]*?};/;
  constantsContent = constantsContent.replace(exportsRegex, match => {
    return (
      match.slice(0, -2) +
      `  ${chainName.toUpperCase()}_RPC,\n  ${chainName.toUpperCase()}_CHAIN_ID,\n  ${chainName.toUpperCase()}_VAULTS_ENDPOINT,\n};`
    );
  });

  fs.writeFileSync(constantsPath, constantsContent);
  console.log(`Added ${chainName} constants including Vaults Endpoint to constants.ts`);

  // Add chain object to src/api/rpc/chains.ts
  const chainsPath = path.join(__dirname, '..', 'src', 'api', 'rpc', 'chains.ts');
  let chainsContent = fs.readFileSync(chainsPath, 'utf8');

  // Add import for the new chain's RPC
  const importStatement = `  ${chainName.toUpperCase()}_RPC,\n`;
  const importRegex = /} from '\.\.\/\.\.\/constants';/;
  chainsContent = chainsContent.replace(importRegex, match => {
    return importStatement + match;
  });

  const chainObject = `
const ${chainName}Chain = {
  id: ${chainId},
  name: '${chainName.charAt(0).toUpperCase() + chainName.slice(1)}',
  network: '${chainName.toLowerCase()}',
  nativeCurrency: {
    decimals: 18,
    name: '${oracleId}',
    symbol: '${oracleId}',
  },
  rpcUrls: {
    public: { http: [${chainName.toUpperCase()}_RPC] },
    default: { http: [${chainName.toUpperCase()}_RPC] },
  },
  blockExplorers: {
    default: { name: '${chainName} explorer', url: '${explorer}' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;
`;

  // Find the "New Chains" section and add the new chain object
  const newChainsRegex = /\/\/\/ New Chains\n\n/;
  const newChainsMatch = chainsContent.match(newChainsRegex);

  if (newChainsMatch) {
    const updatedNewChains = newChainsMatch[0] + chainObject + '\n';
    chainsContent = chainsContent.replace(newChainsRegex, updatedNewChains);
  } else {
    console.warn('"New Chains" section not found in chains.ts');
    chainsContent += '\n' + chainObject;
  }

  // Add the new chain to the getChain export
  const getChainRegex = /export const getChain: Partial<Record<ChainId, Chain>> = {[\s\S]*?} as const;/;
  chainsContent = chainsContent.replace(getChainRegex, match => {
    return match.slice(0, -11) + `  [ChainId.${chainName}]: ${chainName}Chain,\n} as const;`;
  });

  fs.writeFileSync(chainsPath, chainsContent);
  console.log(
    `Added ${chainName} chain object to src/api/rpc/chains.ts under "New Chains", to getChain export, and imports`
  );

  // Add the chain to src/api/rpc/rpcs.ts
  const rpcsPath = path.join(__dirname, '../src/api/rpc/rpcs.ts');
  let rpcsContent = fs.readFileSync(rpcsPath, 'utf8');

  // Add the chain to the rpcs object
  const rpcsObjectRegex = /const rpcs: Record<ChainId, string\[\]> = {[\s\S]*?};/;
  rpcsContent = rpcsContent.replace(rpcsObjectRegex, match => {
    return match.slice(0, -2) + `  [ChainId.${chainName}]: ['${rpc}'],\n};`;
  });

  fs.writeFileSync(rpcsPath, rpcsContent);
  console.log(`Added ${chainName} to src/api/rpc/rpcs.ts`);
}

Promise.resolve(addChain()).catch(console.error);
