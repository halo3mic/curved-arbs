const adder = require('../tools/adder/adder')


async function queryDodoPool() {
    let poolAddress = '0x75c23271661d9d143dcb617222bc4bec783eff34'
    let poolMng = new adder.PoolManager()
    let poolData = await poolMng.queryData(poolAddress)
    console.log('pooldata:', poolData)
}

queryDodoPool()