"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSymbolTokenMapToAddressTokenMap = convertSymbolTokenMapToAddressTokenMap;
function convertSymbolTokenMapToAddressTokenMap(idTokenMap) {
    const addressToId = Object.keys(idTokenMap).reduce((acc, id) => {
        acc[idTokenMap[id].address] = id;
        return acc;
    }, {});
    return new Proxy(addressToId, {
        get(_, address) {
            const idOrToken = addressToId[address];
            if (!idOrToken) {
                return undefined;
            }
            if (typeof idOrToken === 'string') {
                return (addressToId[address] = { id: idOrToken, ...idTokenMap[idOrToken] });
            }
            return idOrToken;
        },
    });
}
