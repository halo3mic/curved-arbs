const { provider, signer } = require('../../src/providers').ws
const config = require('../../src/config')
const resolve = require('path').resolve
const ethers = require('ethers')
const fs = require('fs')
// const { pool, tokens } = require('../../src/arb/instrManager')
const { getExchanges } = require('../../src/exchanges')
const { Console } = require('console')
// const ganache = require('../../src/ganache')
const prompt = require('prompt-sync')()

// const ABIS = {
//     'erc20': require('../../config/abis/erc20.json'),
//     'uniswapPool': require('../../config/abis/uniswapPool.json'),
//     'pangolinPool': require('../../config/abis/pangolinPool.json'),
// }


class Manager {

    indexShift = 1

    getFromAddress(address) {
        const currentData = this.getCurrentData()
        if (this.isAdded(address)) {
            return currentData.filter(e=>e.address==address)[0]
        }
        return this.add(address, currentData)
    }

    isAdded(address) {
        return this.getCurrentData().map(e=>e.address.toLowerCase()).includes(address.toLowerCase())
    }

    async add(address, currentData) {
        if (!currentData) {
            currentData = this.getCurrentData()
        }
        if (this.isAdded(address)) {
            console.log(`Pool with address ${address} already added!`)
            return
        }
        const newElement = await this.queryData(address).catch(e=>{
            console.log('Error occured when trying to add pool with address ', address)
            console.log(e)
        })
        console.log(newElement)
        newElement['id'] = this.getNewId()
        // save
        var ok = this.save(newElement)
        if (ok) {
            console.log(newElement)
            console.log('Saved!')
            return newElement
        }
        else {
            return this.getFromAddress(address)
        } 

    }

    getCurrentData() {
        return JSON.parse(fs.readFileSync(this.srcFilePath, 'utf8'))
    }

    getNewId() {
        const ids = this.getCurrentData().map(e => {
            return parseInt(e.id.replace(this.prefix, '').replace('0', ''))
        })
        if (ids.length==0) {
            return this.prefix+'00000'
        }
        const newId = this.prefix + (Math.max(...ids)+this.indexShift).toString().padStart(5, '0')
        // this.indexShift ++
        return newId
    }

    save(newElement) {
        try {
            if (this.isAdded(newElement.address)) {
                return
            }
            let updatedData = [...this.getCurrentData(), newElement]
            fs.writeFileSync(this.dstFilePath, JSON.stringify(updatedData, null, 4))
            return true
        } catch(e) {
            console.log('Couldnt save!')
            console.log(e)
            return 
        }
    }
}


class TokenManager extends Manager {

    dstFilePath = resolve(`${__dirname}/../../config/tokens.json`)
    // srcFilePath = resolve(`${__dirname}/../../config/tokens.json`)
    srcFilePath = this.dstFilePath
    prefix = 'T'

    async queryData(address) {
        const tknData = {}
        // to checksum 
        try {
            var addressCS = ethers.utils.getAddress(address)
        } catch {
            console.log('Invalid address: ', address)
        }
        // token contract
        const tknContract = new ethers.Contract(
            addressCS,
            ABIS['erc20'],
            provider
        )
        const symbolExceptions = {
            '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': 'MKR'
        }
        tknData['address'] = addressCS
        tknData['symbol'] = addressCS in symbolExceptions ? symbolExceptions[addressCS] : await tknContract.symbol()
        tknData['decimal'] = await tknContract.decimals().then(d => d.toString())

        return tknData
    }
}

class PoolManager extends Manager {

    dstFilePath = resolve(`${__dirname}/../../config/pools.json`)
    srcFilePath = this.dstFilePath
    // srcFilePath = resolve(`${__dirname}/../../config/pools.json`)
    prefix = 'P'
    exchangeSymbols = {
        "Uniswap": "uniswap", 
        "SushiSwap": "sushiswap", 
        "CRO": "crypto", 
        "Mooniswap": "mooniswap", 
        "LinkSwap": "linkswap", 
        "WSwap": "whiteswap", 
        "Polyient": "polyient",
        "Balancer": "balancer", 
        "SashimiSwap": "sashimiswap", 
        "SakeSwap": "sakeswap"
    }

    async queryData(address) {
        try {
            var addressCS = ethers.utils.getAddress(address)
        } catch {
            console.log('Invalid address: ', address)
        }
        try {
            const poolContract = new ethers.Contract(
                addressCS,
                ABIS['dodoPool'],
                provider
            )
            // For Dodo
            const supervisor = await poolContract['_SUPERVISOR_']()
            console.log(supervisor)
            if (supervisor.toLowerCase()=='0x9c59990ec0177d87ed7d60a56f584e6b06c639a2') {
                return this.queryDodo(addressCS)
            }
            return 'stop'
        } catch (e) {
            const poolContract = new ethers.Contract(
                addressCS,
                ABIS['uniswapPool'],
                provider
            )
            const lpTknSymbol = await poolContract.name().then(s => s.split('-')[0].split(' ')[0])
            if (!Object.keys(this.exchangeSymbols).includes(lpTknSymbol)) {
                let msg = 'Could not recognise exchange with LP token: '
                msg += lpTknSymbol + ' for pool with address ' + addressCS
                throw new Error(msg)
            } 
            const exchange = this.exchangeSymbols[lpTknSymbol]
            if (exchange=='balancer') {
                return this.queryBalancer(addressCS)
            } else if (exchange=='mooniswap') {
                return this.queryMooniswap(addressCS)
            } else {
                return this.queryUni(addressCS, exchange)
            }  
        }
             
    }

    async queryDodo(address) {
        const exchange = 'dodoV1'
        const poolData = {}
        const poolContract = new ethers.Contract(
            address,
            ABIS['dodoPool'],
            provider
        )
        poolData['address'] = address
        poolData['fee'] = await poolContract['_LP_FEE_RATE_']().then(f => ethers.utils.formatUnits(f))
        const tknAdresses = [
            await poolContract['_BASE_TOKEN_'](), 
            await poolContract['_QUOTE_TOKEN_'](),
        ]
        var tknMng = new TokenManager()
        var tkns = await Promise.all(tknAdresses.map(async tknAdd => {
            return await tknMng.getFromAddress(tknAdd)
        }))
        poolData['tkns'] = tkns.map(t => {
            return t.id
        })
        poolData['symbol'] = tkns.map(t => t.symbol).join('').toLowerCase()
        poolData['symbol'] += '_' + exchange
        poolData['exchange'] = exchange

        return poolData
    }

    async queryUni(address, exchange) {
        const poolData = {}
        const poolContract = new ethers.Contract(
            address,
            ABIS['uniswapPool'],
            provider
        )
        poolData['address'] = address
        poolData['fee'] = 0.003
        const tknAdresses = [
            await poolContract.token0(), 
            await poolContract.token1()
        ]
        var tknMng = new TokenManager()
        var tkns = await Promise.all(tknAdresses.map(async tknAdd => {
            return await tknMng.getFromAddress(tknAdd)
        }))
        poolData['tkns'] = tkns.map(t => {
            return {id: t.id, weight: 0.5}
        })
        poolData['symbol'] = tkns.map(t => t.symbol).join('').toLowerCase()
        poolData['symbol'] += '_' + exchange
        poolData['exchange'] = exchange

        return poolData
    }
    async queryMooniswap(address) {
        const poolData = {}
        const poolContract = new ethers.Contract(
            address,
            ABIS['mooniswapPool'],
            provider
        )
        poolData['address'] = address
        poolData['fee'] = 0.003
        const tknAdresses = await poolContract.getTokens()
        if (tknAdresses.length==1) {
            tknAdresses.push('0x0000000000000000000000000000000000000000')
        }
        var tknMng = new TokenManager()
        var tkns = await Promise.all(tknAdresses.map(async tknAdd => {
            return await tknMng.getFromAddress(tknAdd)
        }))
        poolData['tkns'] = tkns.map(t => {
            return {id: t.id, weight: 0.5}
        })
        poolData['symbol'] = tkns.map(t => t.symbol).join('').toLowerCase()
        poolData['symbol'] += '_mooniswap'
        poolData['exchange'] = 'mooniswap'

        return poolData
    }
    async queryBalancer(address) {
        const poolData = {}
        const poolContract = new ethers.Contract(
            address,
            ABIS['balancerPool'],
            provider
        )
        await poolContract.isFinalized().then(r => {
            if (!r) {
                throw new Error(`Balancer pool with address ${address} is not finalized!`)
            }
        })
        poolData['address'] = address
        poolData['fee'] = await poolContract.getSwapFee().then(f => {
            return parseFloat(ethers.utils.formatUnits(f))
        })
        const tknAdresses = await poolContract.getFinalTokens()
        var tknMng = new TokenManager()
        var tkns = await Promise.all(tknAdresses.map(async tknAdd => {
            return await tknMng.getFromAddress(tknAdd)
        }))
        poolData['tkns'] = await Promise.all(tkns.map(async t => {
            return {
                id: t.id, 
                weight: await poolContract.getNormalizedWeight(t.address).then(w => {
                    return parseFloat(ethers.utils.formatUnits(w))
                })
            }
        }))
        poolData['symbol'] = tkns.map(t => t.symbol).join('').toLowerCase()
        poolData['symbol'] += '_balancer'
        poolData['exchange'] = 'balancer'
        
        return poolData
    }
}


class InstructionManager {

    srcPoolsPath = resolve(`${__dirname}/../../config/pools.json`)
    srcTokensPath = resolve(`${__dirname}/../../config/tokens.json`)
    dstInstrPath = resolve(`${__dirname}/../../config/paths.json`) 
    // srcApprovalsPath = resolve(`${__dirname}/./new/approvals.json`)
    srcInstrPath = this.dstInstrPath
    // srcInstrPath = resolve(`${__dirname}/../../config/instructions.json`) 
    prefix = 'I'
    indexShift = 1

    constructor() {
        // this.exchanges = getExchanges(provider)
        this.oldData = this.getCurrentData(this.srcInstrPath)
        this.tokens = this.getCurrentData(this.srcTokensPath)
        this.pools = this.getCurrentData(this.srcPoolsPath)
        // this.approvals = this.getCurrentData(this.srcApprovalsPath)
    }

    findPaths(pairs, tokenIn, tokenOut, maxHops, currentPairs, path, circles) {
        circles = circles || []
        currentPairs = currentPairs || []
        path = path || []
        for (let i=0; i<pairs.length; i++) {
            let newPath = path.length>0 ? [...path] : [tokenIn]
            let tempOut
            let pair = pairs[i]
            let pairTkns = pair.tkns
            // console.log(tokenIn, pairTkns, pairTkns[0], pairTkns[1])
            if (tokenIn!=pairTkns[0] && tokenIn!=pairTkns[1]) {
                continue
            } else if (tokenIn==pairTkns[0]) {
                tempOut = pairTkns[1]
            } else {
                tempOut = pairTkns[0]
            }
            newPath.push(tempOut)
            if (tokenOut==tempOut && path.length>=2) {
                let c = { 'pools': [...currentPairs, pair.id], 'tkns': newPath }
                circles.push(c)
            } else if (maxHops > 1 && pairs.length > 1) {
                let pairsExcludingThisPair = [...pairs.slice(0,i), ...pairs.slice(i+1)]
                circles = this.findPaths(pairsExcludingThisPair, tempOut, tokenOut, maxHops-1, [...currentPairs, pair.id], newPath, circles)
            }
        }
        return circles
    }

    findInstructions() {
        let tokenIn = config.BASE_ASSET
        let tokenOut = config.BASE_ASSET
        let maxHops = config.MAX_HOPS
        let pairs = [...this.pools]
        let paths = this.findPaths(pairs, tokenIn, tokenOut, maxHops)
        paths.forEach(p=>this.addInstruction(p))
    }


    async addInstruction(path) {
        for (let i of this.oldData) {
            let check1 = i.pools.join() == path.pools.join()
            let check2 = i.tkns.join() == path.tkns.join()
            if (check1 && check2) {
                console.log('Path already added')
                return
            }
        }
        
        try {
            // Add instructions for pools both ways
            var tknRouteSymbol = path.tkns.map(tId=>this.tokens.filter(tObj=>tObj.id==tId)[0].symbol).join('=>').toLowerCase()
        } catch (e) {
            console.log('error occured')
            console.log(path.tkns)
            console.log(path)
            throw e
        }
        let exchangePath = path.pools.map(pId=>this.pools.filter(pObj=>pObj.id==pId)[0].exchange)
        if (!exchangePath.includes('dodoV1')) {
            console.log('Does not include Dodo!')
            return
        }
        let exchangesChain = exchangePath.join('=>').toLowerCase()
        let pathSymbol = tknRouteSymbol + '_' + exchangesChain
        console.log(`Adding path ` + pathSymbol)
        // Pool1 --> Pool2
        // let gasEstimate = await this.estimateGas([pool1, pool2], [baseTknObj.address, midTknObj.address, baseTknObj.address]).catch(e => {
        //     console.log('Couldnt estimate gas, aborting!\nDetails:', e)
        //     return
        // })
        // if (!gasEstimate) {
        //     return
        // }
        let gasEstimate = 3000000
        // let archerGasAdd = 0
        let instrObj1 = {
            id: this.getNewId(), 
            symbol: pathSymbol,
            tkns: path.tkns, 
            pools: path.pools, 
            enabled: true, 
            gasAmount: gasEstimate, 
            // gasAmountArcher: gasEstimate.add(archerGasAdd).toString(), 
        }
        console.log(instrObj1)
        this.saveInstr(instrObj1)
        // Pool2 --> Pool1
    }
    getCurrentData(path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'))
    }

    getNewId() {
        if (this.oldData.length==0) {
            return this.prefix+'00000'
        }
        const ids = this.oldData.map(e => {
            return parseInt(e.id.replace(this.prefix, '').replace('0', ''))
        })
        const newId = this.prefix + (Math.max(...ids)+this.indexShift).toString().padStart(5, '0')
        // this.indexShift ++
        return newId
    }

    // async estimateGas(poolPath, tknPath) {
    //     let ganacheProvider = connectToGancheProvider({unlocked_accounts: [DISPATCHER]})
    //     let ganacheSigner = ganacheProvider.getSigner(DISPATCHER)
    //     let tknPath1 = tknPath.slice(0, 2)
    //     let tknPath2 = tknPath.slice(1, 3)
    //     let exchange1 = this.exchanges[poolPath[0].exchange]
    //     let exchange2 = this.exchanges[poolPath[1].exchange]
    //     let inputAmount = ethers.utils.parseEther('1')
    //     let tx1 = await exchange1.formTradeTx(tknPath1, inputAmount, 0, 300, false).then(tx=>tx.tradeTx)
    //     tx1.from = DISPATCHER
    //     tx1.value = inputAmount
    //     let gasUsed1 = await ganacheSigner.sendTransaction(tx1).then(async r=>ganacheProvider.getTransactionReceipt(r.hash).then(tr=>tr.gasUsed))
    //     let tknBal = await ganache.getErc20Balance(ganacheProvider, tknPath[1], DISPATCHER)
    //     tknBal = tknBal.div(2)
    //     if (!this.approvals[tknPath[1]][exchange2.routerAddress]) {
    //         await ganache.approveErc20(ganacheSigner, tknPath[1], exchange2.routerAddress)
    //     }
    //     let tx2 = await exchange2.formTradeTx(tknPath2, tknBal, 0, 300, false).then(tx=>tx.tradeTx)
    //     tx2.from = DISPATCHER
    //     let gasUsed2 = await ganacheSigner.sendTransaction(tx2).then(async r=>ganacheProvider.getTransactionReceipt(r.hash).then(tr=>tr.gasUsed))

    //     return gasUsed1.add(gasUsed2)
    // }

    saveInstr(newInstr) {
        try {
            this.oldData.push(newInstr)
            fs.writeFileSync(this.dstInstrPath, JSON.stringify(this.oldData, null, 4))
            return true
        } catch(e) {
            console.log('Couldnt save!')
            console.log(e)
            return 
        }
    }
}


class ApprovalsManager {

    srcApprovalsPath = resolve(`${__dirname}/../../config/approvals.json`)
    tknMng = new TokenManager()
    poolMng = new PoolManager()
    currentApprovals = this.getCurrentData(this.srcApprovalsPath)
    exchanges = getExchanges(provider)

    async getTknAllowance(tknAddress, spender) {
        let tknContract = new ethers.Contract(tknAddress, config.ABIS['erc20'], provider)
        return tknContract.allowance(config.DISPATCHER, spender)
    }

    async updateAllApprovals() {
        let approvalsNeeded = this.getApprovalsNeeded()
        for (let a of Object.entries(approvalsNeeded)){
            let [ tkn, spenders ] = a
            let allowances = {}
            for (let s of spenders) {
                console.log(s)
                let a = await this.getTknAllowance(tkn, s)
                allowances[s] = a.toString()
                console.log(`${tkn} allowance for spender ${s} is ${allowances[s]}`)
            }
            this.updateTknApprovals(tkn, allowances)
        }
        return true
    }

    getApprovalsNeeded() {
        let approvalsNeeded = {}
        let pools = this.poolMng.getCurrentData()
        let tkns = this.tknMng.getCurrentData()
        pools.forEach(p => {
            let spender = this.exchanges[p.exchange].approver
            p.tkns.forEach(t => {
                let tknAddress = tkns.filter(tObj=>tObj.id==t)[0].address
                if (!Object.keys(approvalsNeeded).includes(tknAddress)) {
                    approvalsNeeded[tknAddress] = [spender]
                } else if (!approvalsNeeded[tknAddress].includes(spender)) {
                    approvalsNeeded[tknAddress].push(spender)
                }
            })
        })
        return approvalsNeeded
    }

    getUnapprovedBySpender() {
        let unapprovedTknsForSpender = {}
        Object.entries(this.currentApprovals).forEach(a => {
            let [ tkn, allowances ] = a
            Object.entries(allowances).forEach(s => {
                let [ spender, amount ] = s
                amount = ethers.BigNumber.from(amount)
                let limit = ethers.utils.parseUnits('7', 28)
                if (amount.gt(limit)) {
                    return
                }
                if (!Object.keys(unapprovedTknsForSpender).includes(spender)) {
                    unapprovedTknsForSpender[spender] = []
                }
                unapprovedTknsForSpender[spender].push(tkn)
            })
        })
        return unapprovedTknsForSpender
    }

    async approve(spender, tokens) {
        let dispatcherContract = new ethers.Contract(config.DISPATCHER, config.ABIS['dispatcher'], signer)
        let tx = await dispatcherContract.populateTransaction.tokenAllowAll(tokens, spender)
        let gasAmount = await provider.estimateGas(tx)
        let gasPrice = await provider.getGasPrice()
        let cost = ethers.utils.formatEther(gasAmount.mul(gasPrice))
        console.log(`Gas cost of tx is ${cost} ETH,\nwith gas price of ${ethers.utils.formatUnits(gasPrice, 9)} gwei and gas amount of ${gasAmount}.`)
        let decision = await prompt('Proceed with transactions?')
        if (decision=='y') {
            let response = await signer.sendTransaction(tx)
            console.log('Pending tx at ', `https://etherscan.io/tx/${response.hash}`)
            await provider.waitForTransaction(response.hash)
        }
        
    }

    async approveAll() {
        let unapproved = this.getUnapprovedBySpender()
        for (let e of Object.entries(unapproved)) {
            console.log(`\nApproving ${e[1]} for spender ${e[0]}!`)
            await this.approve(...e)
        }
        console.log('\n\nSaving changes ... ')
        await this.updateAllApprovals()
        console.log('Finished!')
        
    }

    updateTknApprovals(tknAddress, allowances) {
        this.currentApprovals[tknAddress] = allowances
        this.save()
    }

    getCurrentData(path) {
        return JSON.parse(fs.readFileSync(path, 'utf8'))
    }

    save() {
        try {
            fs.writeFileSync(this.srcApprovalsPath, JSON.stringify(this.currentApprovals, null, 4))
            return true
        } catch(e) {
            console.log('Couldnt save!')
            console.log(e)
            return 
        }
    }
}

module.exports = { PoolManager, TokenManager, InstructionManager, ApprovalsManager }