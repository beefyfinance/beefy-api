const getHfiApys = require('./getHfiApys');
const getHfiLpApys = require('./getHfiLpApys');
const getLavaLpApys = require('./getLavaLpApys');
const getLavaApy = require('./getLavaApy');
const getMdexLpApys = require('./getMdexLpApys');
const getHecoBifiMaxiApy = require('./getHecoBifiMaxiApy');
const getHecoMdexMdxApy = require('./getHecoMdexMdxApy');
const getLendhubApys = require('./getLendhubApys');
const getLendhubLpApys = require('./getLendhubLpApys');

const getApys = [
  getHfiApys,
  getLavaLpApys,
  getLavaApy,
  getHfiLpApys,
  getMdexLpApys,
  getHecoBifiMaxiApy,
  getHecoMdexMdxApy,
  getLendhubApys,
  getLendhubLpApys,
];

const getHecoApys = async () => {
  let apys = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

module.exports = { getHecoApys };
