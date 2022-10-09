import getBalancerPrices from '../common/getBalancerPrices';
import { optimismWeb3 as web3 } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import beetsPools from '../../../data/optimism/beethovenxSteadyBeets.json';

const pools = [...beetsPools];

const getSteadyBeetsPrice = async tokenPrices => {
  let results = await getBalancerPrices(web3, chainId, pools, tokenPrices);
  let prices = {};
  for (const [key, value] of Object.entries(results)) {
    let price = { [key]: value.price };
    prices = { ...prices, ...price };
  }
  return prices;
};

export default getSteadyBeetsPrice;
