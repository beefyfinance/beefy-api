import {
  fetchAppPromos,
  fetchAppVaults,
  getAppPromos,
  getAppVaults,
  restoreAppConfigs,
} from '../../utils/appConfigs.ts';
import { isApiChain, type RawChain, RawChains } from '../../utils/chain.ts';
import { envNumber } from '../../utils/env.ts';
import { withVaultDefaults } from '../../utils/getVaults.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { contextAllSettled, isContextResultRejected, withTimeout } from '../../utils/promise.ts';
import { getBoostPromos, withBoostDefaults } from '../boosts/fetchBoostData.ts';

const logger = getLoggerFor({ module: 'raw' });

const INIT_DELAY = envNumber('RAW_CONFIGS_INIT_DELAY', 5 * 1000);
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;
const RETRY_INTERVAL = 5 * 60 * 1000;
const TIMEOUT = 60 * 1000;

// supported chains are kept fresh by the vault and boost services
const disabledChains = RawChains.filter(chain => !isApiChain(chain));

export function getRawVaults(chain: RawChain) {
  return getAppVaults(chain).map(vault => withVaultDefaults(vault, chain));
}

export function getAllRawVaults() {
  return RawChains.flatMap(chain => getRawVaults(chain));
}

export function getRawBoosts(chain: RawChain) {
  return getBoostPromos(getAppPromos(chain)).map(boost => withBoostDefaults(boost, chain));
}

export function getAllRawBoosts() {
  return RawChains.flatMap(chain => getRawBoosts(chain));
}

async function updateDisabledChains() {
  const start = Date.now();
  const results = await contextAllSettled(disabledChains, chain =>
    withTimeout(Promise.all([fetchAppVaults(chain), fetchAppPromos(chain)]), TIMEOUT)
  );
  const rejected = results.filter(isContextResultRejected);
  rejected.forEach(result => logger.warn({ chain: result.context, err: result.reason }, 'chain update failed'));
  logger.info(
    { chains: results.length - rejected.length, total: results.length, durationMs: Date.now() - start },
    'updated disabled chain configs'
  );

  setTimeout(updateDisabledChains, rejected.length ? RETRY_INTERVAL : REFRESH_INTERVAL);
}

export async function initRawConfigService() {
  await restoreAppConfigs(RawChains);
  setTimeout(updateDisabledChains, INIT_DELAY);
}
