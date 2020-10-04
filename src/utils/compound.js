const compound = (r, n = 365, t = 1) => {
  return (1 + r / n) ** (n * t) - 1;
};

module.exports = compound;
