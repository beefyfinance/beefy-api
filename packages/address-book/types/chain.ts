import { BeefyFinance } from './beefyfinance';
import type Token from './token';

export default interface Chain {
  readonly platforms: Record<string, Record<string, unknown>> & {
    beefyfinance: BeefyFinance;
  };
  readonly tokens: Record<string, Token>;
  readonly tokenAddressMap: Record<string, Token>;
}
