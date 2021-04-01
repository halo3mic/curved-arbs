const paths = require('../config/paths.json')
const pools = require('../config/pools.json')
const tokens = require('../config/tokens.json')


const poolAddressMap = Object.fromEntries(pools.map(pool => [pool.address, pool]))
const poolIdMap = Object.fromEntries(pools.map(pool => [pool.id, pool]))
const tknIdMap = Object.fromEntries(tokens.map(tkn => [tkn.id, tkn]))
const tknAddressMap = Object.fromEntries(tokens.map(tkn => [tkn.address, tkn]))
const pathIdMap = Object.fromEntries(paths.map(path => [path.id, path]))


module.exports = {
    poolAddressMap,
    tknAddressMap,
    pathIdMap,
    poolIdMap,
    tknIdMap,
    tokens, 
    paths, 
    pools, 
}