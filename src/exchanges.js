const { ABIS, ROUTERS, ETH_ADDRESS, WETH_ADDRESS } = require('./config')
const ethers = require('ethers')
const instrMng = require('./instrMng')
const utils = require('./utils')
const formulas = require('./formulas')


class Uniswap {

    constructor(provider) {
        this.provider = provider
        this.routerAddress = ROUTERS.UNISWAP
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter'], 
            this.provider
        )
    }

    calcAmountOut(amountIn, reserveIn, reserveOut) {
        if (amountIn.eq('0')) {
            return ethers.constants.Zero
        }
        let taxedIn = d997.mul(amountIn)
        let numerator = taxedIn.mul(reserveOut)
        let denominator = d1000.mul(reserveIn).add(taxedIn)
        return numerator.div(denominator)
    }

    getAmountOut(amountIn, poolData, tknOrder) {
        let pool = instrMng.poolIdMap[poolData.poolId]  // TODO Pass the whole pool object?
        let reserves = [poolData.reserve0, poolData.reserve1]
        if (tknOrder.filter(t1=>pool.tkns.includes(t1)).length!=2) {
            throw new Error(`Wrong token order and pool combination for pool ${pool.id} and token order ${tknOrder}.`)
        }
        if (tknOrder[0]==pool.tkns[1] && tknOrder[1]==pool.tkns[0]) {
            reserves.reverse()
        }
        if (amountIn>reserves[0]) {
            return 0
        }
        let amountOut = formulas.uniswap.calcAmountOut(
            amountIn, 
            reserves[0], 
            reserves[1]
        )
        return amountOut
    }

    async fetchReservesRaw(poolAddress) {
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['uniswapPool'], 
            this.provider
        )
        return await poolContract.getReserves()
    }


    async queryAmountOut(amountIn, path) {
        return this.routerContract.getAmountsOut(amountIn, path).then(r => r[1])
    }

    async getPoolData(poolId, convert) {
        let pool = instrMng.poolIdMap[poolId]
        let reserves = await this.fetchReservesRaw(pool.address)
        if (convert) {
            let dec0 = instrMng.tknIdMap[pool.tkns[0]].decimal
            let dec1 = instrMng.tknIdMap[pool.tkns[1]].decimal
            reserves = utils.convertObjectWithBigNumberToNumber(
                reserves.slice(0, 2), 
                {'0': dec0, '1': dec1}
            )
        }
        let poolData = {
            reserve0: reserves[0],
            reserve1: reserves[1],
            poolId
        }
        return poolData
    }

    async makeTrade(args, wethEnabled, deadlineOffset) {
        deadlineOffset = deadlineOffset || 300
        // outputAmount being 0 can be very dangerous if tx sent by itself
        let tradeTimeout = Math.round((Date.now()/1000) + deadlineOffset)
        if (args.tknPath[0]==WETH_ADDRESS && !wethEnabled) {
            var tradeTx = await this.routerContract.populateTransaction.swapExactETHForTokens(
                args.amountOut, 
                args.tknPath, 
                args.to, 
                tradeTimeout
            )
            tradeTx.value = args.amountIn
        } else if (args.tknPath[args.tknPath.length-1]==WETH_ADDRESS && !wethEnabled) {
            var tradeTx = await this.routerContract.populateTransaction.swapExactTokensForETH(
                args.amountIn,
                args.amountOut, 
                args.tknPath, 
                args.to, 
                tradeTimeout
            )
        } else {
            var tradeTx = await this.routerContract.populateTransaction.swapExactTokensForETH(
                args.amountIn,
                args.amountOut, 
                args.tknPath, 
                args.to, 
                tradeTimeout
            )
        }
        return tradeTx   
    }
}

class DodoV1 {

    constructor(provider) {
        this.provider = provider
        this.routerAddress = ROUTERS.DODO
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['dodoRouter'], 
            this.provider
        )
    }

    async fetchPoolState(poolAddress) {
        let methodsMap = {
            '_TARGET_QUOTE_TOKEN_AMOUNT_': 'Q0',
            '_TARGET_BASE_TOKEN_AMOUNT_': 'B0',
            '_TRADE_ALLOWED_': 'tradeAllowed', 
            '_LP_FEE_RATE_': 'lpFee',
            '_QUOTE_BALANCE_': 'Q',
            'getOraclePrice': 'i', 
            '_BASE_BALANCE_': 'B', 
            '_R_STATUS_': 'R',
            '_K_': 'k', 
        }
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['dodoPool'], 
            this.provider
        )
        let response = Object.keys(methodsMap).map(async method => {
            return [
                methodsMap[method],
                await poolContract[method]()
            ]
        })
        return Promise.all(response).then(Object.fromEntries)
    }

    async getPoolData(poolId, convert) {
        let pool = instrMng.poolIdMap[poolId]
        let poolInfo = await this.fetchPoolState(pool.address)
        if (convert) {
            let baseDec = instrMng.tknIdMap[pool.tkns[0]].decimal
            let quoteDec = instrMng.tknIdMap[pool.tkns[1]].decimal
            poolInfo = utils.convertObjectWithBigNumberToNumber(
                poolInfo, 
                {
                    Q0: quoteDec, 
                    Q: quoteDec, 
                    i: quoteDec, 
                    B0: baseDec, 
                    B: baseDec, 
                }
            )
        }
        poolInfo.poolId = poolId
        return poolInfo
    }

    getAmountOut(amountIn, poolData, tknOrder) {
        let pool = instrMng.poolIdMap[poolData.poolId]
        // Buying quote or base?
        if (!tknOrder.includes(pool.tkns[0]) || !tknOrder.includes(pool.tkns[1])) {
            throw new Error(`Wrong token order and pool combination for pool ${pool.id} and token order ${tknOrder}.`)
        }
        let side = pool.tkns[0]==tknOrder[0] ? 'sellBase' : 'sellQuote'
        // Quote or base shortage?
        let state
        if (side=='sellBase') {
            state = (poolData.B+amountIn) < poolData.B0 ? 'baseShortage' : 'quoteShortage'  // Ignore equilibrium
            if (poolData.B<amountIn) {
                return 0
            }
        } else {
            state = (poolData.Q+amountIn) < poolData.Q0 ? 'quoteShortage' : 'baseShortage'  // Ignore equilibrium
            if (poolData.Q<amountIn) {
                return 0
            }
        }
        // Call the right method
        let method = formulas.dodo.formulasMap[state][side]
        // console.log(method.name)
        let amountOut = method(amountIn, poolData)
        return amountOut
    }

    async queryBuyBaseToken(poolAddress, amount) {
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['dodoPool'], 
            this.provider
        )
        return poolContract.queryBuyBaseToken(amount)
    }

    async querySellBaseToken(poolAddress, amount) {
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['dodoPool'], 
            this.provider
        )
        return poolContract.querySellBaseToken(amount)
    }

    async querySellQuoteToken(poolAddress, amount) {
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['dodoPool'], 
            this.provider
        )
        return poolContract.querySellBaseToken(amount)
    }

    getDirections(poolPath, fromTkn, toTkn) {
        // This is string of bytes where position of each represents the direction of the trade
        // 0 -> basetkn to quotetkn
        // 1 -> quotetkn to basetkn
        let directionsBytes = ''
        poolPath.forEach(poolId => {
            let pool = instrMng.poolAddressMap[poolId]
            if (pool.tkns[0].id==fromTkn) {
                directionsBytes = '0' + directionsBytes
            } else {
                directionsBytes = '1' + directionsBytes
            }
        })
        return directionsBytes
    }

    async makeTrade(args, wethEnabled, deadlineOffset) {
        deadlineOffset = deadlineOffset || 300
        let fromTkn = args.tknPath[0]==WETH_ADDRESS && !wethEnabled ? ETH_ADDRESS : args.tknPath[0]
        let toTkn = args.tknPath[1]==WETH_ADDRESS && !wethEnabled ? ETH_ADDRESS : args.tknPath[1]
        let deadline = Math.round((Date.now()/1000) + deadlineOffset)
        let directions = this.getDirections(args.poolPath)
        let txPayload = await this.routerContract.populateTransaction.dodoSwapV1(
            fromTkn,
            toTkn,
            args.amountIn,
            args.amountOut,
            args.poolPath,
            directions,
            false,
            deadline
        )
        if (args.tknPath[0]==ETH_ADDRESS) {
            txPayload.value = args.amountIn
        }
        return txPayload
    }
}

function getExchanges(provider) {
    return {
        uniswap: new Uniswap(provider), 
        dodo: new DodoV1(provider)
    }   
}

module.exports = { getExchanges }
