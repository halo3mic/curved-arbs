const config = require('./config')
const ethers = require('ethers')
const instrMng = require('./instrMng')
const utils = require('./utils')
const formulas = require('./formulas')


class Dex {

    getPoolData() {

    }
    getAmountOut() {

    }
    makeTrade() {

    }
    makeQuery() {

    }
}


class Uniswap {

    constructor(provider) {
        this.provider = provider
        this.routerAddress = config.ROUTERS.UNISWAP
        this.approver = config.APPROVERS.UNISWAP
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            config.ABIS['uniswapRouter'], 
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
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        const poolContract = new ethers.Contract(
            poolAddress, 
            config.ABIS['uniswapPool'], 
            this.provider
        )
        return await poolContract.getReserves()
    }


    async queryAmountOut(amountIn, path) {
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        return this.routerContract.getAmountsOut(amountIn, path).then(r => r[1])
    }

    async getPoolData(poolId, convert) {
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        let pool = instrMng.poolIdMap[poolId]
        try {
            var reserves = await this.fetchReservesRaw(pool.address)
            if (convert) {
                let dec0 = instrMng.tknIdMap[pool.tkns[0]].decimal
                let dec1 = instrMng.tknIdMap[pool.tkns[1]].decimal
                reserves = utils.convertObjectWithBigNumberToNumber(
                    reserves.slice(0, 2), 
                    {'0': dec0, '1': dec1}
                )
            }
        } catch {
            reserves = [ 0, 0 ]  // If the pool doesn't exist 
        }
        let poolData = {
            reserve0: reserves[0],
            reserve1: reserves[1],
            poolId
        }
        return poolData
    }

    async makeTrade(args, wethEnabled, deadlineOffset) {
        // if (!this.provider) {
        //     throw new Error('This method call requires a web3 provider.')
        // }
        deadlineOffset = deadlineOffset || 300
        let amountOut = ethers.utils.parseUnits('1', 'wei')
        // outputAmount being 0 can be very dangerous if tx sent by itself!!!
        let tradeTimeout = Math.round((Date.now()/1000) + deadlineOffset)
        if (args.tknPath[0]==config.WETH_ADDRESS && !wethEnabled) {
            var tx = await this.routerContract.populateTransaction.swapExactETHForTokens(
                amountOut, 
                args.tknPath, 
                args.to, 
                tradeTimeout
            )
            tx.value = args.amountIn
        } else {
            var tx = await this.routerContract.populateTransaction.swapExactTokensForTokens(
                args.amountIn,
                amountOut, 
                args.tknPath, 
                args.to, 
                tradeTimeout
            )
        }
        // If input location is 0 input amount needs to be injected on the call
        const inputLocs = args.amountIn==ethers.constants.Zero && !tx.value ? [56] : []   // In bytes

        return { tx, inputLocs }   
    }

    async makeQuery({ amountIn, tknPath }) {
        // Input amount needs to in base units of asset (eg. wei)
        const queryContract = new ethers.Contract(
            config.ROUTERS.UNIISH_PROXY, 
            ABIS['uniswapRouterProxy']
        )
        let tx = await queryContract.populateTransaction.getOutputAmount(
            this.routerAddress, 
            amountIn, 
            tknPath[0], 
            tknPath[1]
        )
        // If input location is 0 input amount needs to be injected on the call
        const inputLocs = amountIn==ethers.constants.Zero ? [88] : []   // In bytes

        return { tx, inputLocs }
    }
}

class Sushiswap extends Uniswap {

    constructor(provider) {
        super(provider)
        this.routerAddress = ROUTERS.SUSHISWAP
        this.approver = config.APPROVERS.SUSHISWAP
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter']
        )
    }
}

class Crypto extends Uniswap {

    constructor(provider) {
        super(provider)
        this.routerAddress = ROUTERS.CRYPTO
        this.approver = config.APPROVERS.CRYPTO
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter']
        )
    }
}

class Linkswap extends Uniswap {

    constructor(provider) {
        super(provider)
        this.routerAddress = ROUTERS.LINKSWAP
        this.approver = config.APPROVERS.LINKSWAP
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter']
        )
    }
}

class Polyient extends Uniswap {

    constructor(provider) {
        super(provider)
        this.routerAddress = ROUTERS.POLYIENT
        this.approver = config.APPROVERS.POLYIENT
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter']
        )
    }
}

class Whiteswap extends Uniswap {

    constructor(provider) {
        super(provider)
        this.routerAddress = ROUTERS.WHITESWAP
        this.approver = config.APPROVERS.WHITESWAP
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter']
        )
    }
}

class Sashimiswap extends Uniswap {

    constructor(provider) {
        super(provider)
        this.routerAddress = ROUTERS.SASHIMISWAP
        this.approver = config.APPROVERS.SASHIMISWAP
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            ABIS['uniswapRouter']
        )
    }
}

class DodoV1 {

    constructor(provider) {
        this.provider = provider
        this.routerAddress = config.ROUTERS.DODO
        this.approver = config.APPROVERS.DODO
        this.routerContract = new ethers.Contract(
            this.routerAddress, 
            config.ABIS['dodoRouter'], 
            this.provider
        )
    }

    async fetchPoolState(poolAddress) {
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
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
            config.ABIS['dodoPool'], 
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
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        let pool = instrMng.poolIdMap[poolId]
        let poolInfo = await this.fetchPoolState(pool.address)
        if (convert) {
            let baseDec = instrMng.tknIdMap[pool.tkns[0]].decimal
            let quoteDec = instrMng.tknIdMap[pool.tkns[1]].decimal
            // console.log('baseDec', baseDec)
            // console.log('quoteDec', quoteDec)
            let iDec = 18-(baseDec-quoteDec)
            poolInfo = utils.convertObjectWithBigNumberToNumber(
                poolInfo, 
                {
                    Q0: quoteDec, 
                    Q: quoteDec, 
                    i: iDec, 
                    B0: baseDec, 
                    B: baseDec, 
                }
            )
        }
        poolInfo.poolId = poolId
        return poolInfo
    }

    getAmountOut(amountIn, poolData, tknOrder) {
        // console.log('Dodo getAmountOut')
        // console.log('amountIn', amountIn)
        // console.log('poolData', poolData)
        // console.log('tknOrder', tknOrder)
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
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        const poolContract = new ethers.Contract(
            poolAddress, 
            ABIS['dodoPool'], 
            this.provider
        )
        return poolContract.queryBuyBaseToken(amount)
    }

    async querySellBaseToken(poolAddress, amount) {
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        const poolContract = new ethers.Contract(
            poolAddress, 
            config.ABIS['dodoPool'], 
            this.provider
        )
        return poolContract.querySellBaseToken(amount)
    }

    async querySellQuoteToken(poolAddress, amount) {
        if (!this.provider) {
            throw new Error('This method call requires a web3 provider.')
        }
        const dodoSellHelper = new ethers.Contract(
            config.DODO_HELPER, 
            config.ABIS['dodoHelper'], 
            this.provider
        )
        return dodoSellHelper.querySellQuoteToken(poolAddress, amount)
    }

    getDirections(poolPath, fromTknAddress) {
        // This is string of bytes where position of each represents the direction of the trade
        // 0 -> basetkn to quotetkn
        // 1 -> quotetkn to basetkn
        // TODO This wont work if multiple pools are passed!!!
        let directionsBytes = ''
        let fromTkn = instrMng.tknAddressMap[fromTknAddress].id
        poolPath.forEach(poolId => {
            let pool = instrMng.poolAddressMap[poolId]

            if (pool.tkns[0]==fromTkn) {
                directionsBytes = '0' + directionsBytes
            } else {
                directionsBytes = '1' + directionsBytes
            }
        })
        return directionsBytes
    }

    async makeTrade(args, wethEnabled, deadlineOffset) {
        // if (!this.provider) {
        //     throw new Error('This method call requires a web3 provider.')
        // }
        deadlineOffset = deadlineOffset || 300
        let fromTkn = args.tknPath[0]==config.WETH_ADDRESS && !wethEnabled ? config.ETH_ADDRESS : args.tknPath[0]
        // let toTkn = args.tknPath[1]==config.WETH_ADDRESS && !wethEnabled ? config.ETH_ADDRESS : args.tknPath[1]
        let toTkn = args.tknPath[1]==config.WETH_ADDRESS ? config.ETH_ADDRESS : args.tknPath[1]
        let deadline = Math.round((Date.now()/1000) + deadlineOffset)
        let directions = this.getDirections(args.poolPath, args.tknPath[0])
        let amountOut = ethers.utils.parseUnits('1', 'wei')
        let tx = await this.routerContract.populateTransaction.dodoSwapV1(
            fromTkn,
            toTkn,
            args.amountIn,
            amountOut,
            args.poolPath,
            directions,
            false,
            deadline
        )
        if (fromTkn==config.ETH_ADDRESS) {
            tx.value = args.amountIn
        }

        // TODO Determine the input loc for Dodo trade transactions
        const inputLocs = args.amountIn==ethers.constants.Zero ? [120] : []   // In bytes
        return { tx, inputLocs }
    }

    async makeQuery({poolPath, tknPath, amountIn}) {
        let poolAddress = poolPath[0] // TODO What if there are multiple pools in step?
        let directions = this.getDirections(poolPath, tknPath[0])
        let dodoSellHelper = new ethers.Contract(
            config.DODO_HELPER, 
            config.ABIS['dodoHelper']
        )
        // TODO Wont work for multiple swaps!
        // console.log('directions:', directions)
        if (directions=='0') {
            // Sell base
            var tx = await dodoSellHelper.populateTransaction.querySellBaseToken(
                poolAddress, 
                amountIn
            )
        } else {
            // Sell quote
            var tx = await dodoSellHelper.populateTransaction.querySellQuoteToken(
                poolAddress, 
                amountIn
            )
        }
        // If input location is 0 input amount needs to be injected on the call
        // TODO Determine the input loc for Dodo trade transactionss
        const inputLocs = amountIn==ethers.constants.Zero ? [88] : []   // In bytes
        return { tx, inputLocs }
    }
}

function getExchanges(provider) {
    return {
        sashimiswap: new Sashimiswap(provider),
        sushiswap: new Sushiswap(provider), 
        whiteswap: new Whiteswap(provider), 
        linkswap: new Linkswap(provider), 
        polyient: new Polyient(provider), 
        uniswap: new Uniswap(provider), 
        dodoV1: new DodoV1(provider),
        crypto: new Crypto(provider), 
    }   
}

module.exports = { getExchanges }
