const { getHolders } = require('../../../utils/getHolders');

let holders = {};

const getHolderCount = async () => {
  return await getHolders();
};

module.exports = getHolderCount;
