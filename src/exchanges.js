const { ABIS, ROUTERS } = require('./config')
const ethers = require('ethers')


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

    async fetchReservesRaw(poolAddress) {
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['uniswapPool'], 
            this.provider
        )
        return await poolContract.getReserves()
    }


    async getAmountOut(amountIn, path) {
        return this.routerContract.getAmountsOut(amountIn, path).then(r => r[1])
    }
}

class Dodo {

    constructor(provider) {
        this.provider = provider
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
}

function getExchanges(provider) {
    return {
        uniswap: new Uniswap(provider), 
        dodo: new Dodo(provider)
    }   
}

module.exports = { getExchanges }
