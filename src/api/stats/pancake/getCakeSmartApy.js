const getCakeSmartApy = apys => {
  return Math.max.apply(Math, Object.values(apys));
};

module.exports = getCakeSmartApy;
