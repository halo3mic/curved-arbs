const { provider } = require('../../src/providers').ws
const config = require('../../src/config')
const ethers = require('ethers')
const adder = require('./adder')
const csv = require('csvtojson')

const FLAGS = {
    'import-csv': importPoolsFromCsv, 
    'import-factory': importPoolsFromFactory, 
    'approve': approveTkns, 
    'paths': generatePaths
}

async function main() {
    let flags = Object.keys(FLAGS).filter(f=>process.argv.includes(f))
    flags.forEach(f=>FLAGS[f]())
}

async function importPoolsFromCsv() {
    console.log('Importing pools from csv ...')
    const sourcePath = `${__dirname}/add.csv`
    const addRequests = await csv().fromFile(sourcePath)
    let poolMng = new adder.PoolManager()
    return Promise.all(
        addRequests.map(async r => poolMng.add(r.poolAddress))
    )
}

async function importPoolsFromFactory() {
    let poolMng = new adder.PoolManager()
    let factoryAbi = require('../../config/abis/uniswapFactory.json')
    Object.values(config.FACTORIES).forEach(async address => {
        console.log(address)
        let factoryContract = new ethers.Contract(address, factoryAbi, provider)
        let max = await factoryContract.allPairsLength().then(l=>l.toNumber())
        let i = 0
        while (i<max) {
            try {
                let a = await factoryContract.allPairs(i)
                poolMng.add(a)
                i ++
            } catch (e) {
                console.log(e)
                break
            }
        }
    })
}

async function approveTkns() {
    console.log('Approving tokens ...')
    let approvalMng = new adder.ApprovalsManager()
    await approvalMng.updateAllApprovals()
    await approvalMng.approveAll()
    return true
}

async function generatePaths() {
    console.log('Generating paths ...')
    let im = new adder.InstructionManager()
    return im.findInstructions()
}

main()
