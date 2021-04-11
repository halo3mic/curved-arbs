const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DispacherTipper", function() {
  const traderAddress = '0xb5789BBBcFbea505fA7bab11E1813b00113fe86f'
  const dispatcherAddress = '0x5dc60BC57d7846EEB5C046345950c69224C83b6E'
  const dispatcherABI = require('./abis/dispatcher.json')
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const wethABI = require('./abis/weth.json')

  let owner, trader, dispatcher, weth, tipper, accounts, profitGenerator

  async function mineWETH(sendTo, amount) {
    await weth.connect(profitGenerator).deposit({ value: amount, gasPrice: '0' })
    await weth.connect(profitGenerator).transfer(sendTo, amount, { gasPrice: '0' })
    return true
  }

  before(async () => {
    // Unlock trader account
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [traderAddress],
    });
    // Define signers
    accounts = await ethers.getSigners();
    [ owner, profitGenerator ] = accounts
    trader = ethers.provider.getSigner(traderAddress)
    // Define contracts
    dispatcher = new ethers.Contract(dispatcherAddress, dispatcherABI, trader)
    weth = new ethers.Contract(wethAddress, wethABI, trader)
    // Deploy dispatcher tipper
    DispatcherTipper = await ethers.getContractFactory('DispatcherTipper');
  })

  beforeEach(async () => {
    // Reset DispatcherTipper state after each test
    tipper = await DispatcherTipper.deploy();
  })

  it('Tipper view methods', async () => {
    expect(await tipper.OWNER()).to.equal(owner.address)
    expect(await tipper.TipJar()).to.equal('0x5312B0d160E16feeeec13437a0053009e7564287')
    expect(await tipper.WETH()).to.equal('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
    expect(await tipper.TIP_RATE_UNIT()).to.equal('1000000000000000000')
    expect(await tipper.MIN_TIP_RATE()).to.equal('0')
  })

  
  describe('setMinTipRate()', () => {
    
    it('Owner can set the rate', async () => {
      expect(await tipper.connect(owner).setMinTipRate('500000000000000000'))
      expect(await tipper.MIN_TIP_RATE()).to.equal('500000000000000000')
    })
  
    it('Non-owner can\'t set the rate', async () => {
      await expect(tipper.connect(accounts[1]).setMinTipRate('500000000000000000'))
      .to.be.revertedWith('Not owner');
      expect(await tipper.MIN_TIP_RATE()).to.equal('0')
    })
  
    it('Rate can\'t exceed TIP_RATE_UNIT', async () => {
      await expect(tipper.connect(owner).setMinTipRate('1100000000000000000'))
      .to.be.revertedWith('Tip to big');
      expect(await tipper.MIN_TIP_RATE()).to.equal('0')
    })

  })
  
  describe('tip()', () => {

      const minerReward = ethers.utils.parseEther('2')

      async function simulateTipMiner({ sender, tipRate, borrowAmount, profitAmount, wrapAmount }) {
        // Balances before
        let senderBalBefore = await ethers.provider.getBalance(sender.address)
        // Send txs
        await mineWETH(sender.address, profitAmount) // Simulate receiving profit
        await weth.connect(sender).deposit({ value: wrapAmount || borrowAmount, gasPrice: '0' })
        await weth.connect(sender).approve(tipper.address, ethers.constants.MaxUint256, {gasPrice: '0'})
        // Balances before
        let minerCoinbase = await ethers.provider.getBlock().then(blockInfo => blockInfo.miner)
        let minerBalBefore = await ethers.provider.getBalance(minerCoinbase)  // In forks miner stays the same
        // Send txs
        await tipper.connect(sender).tip(borrowAmount, tipRate, {gasPrice: '0'})
        // Balances after txs
        let minerBalAfter = await ethers.provider.getBalance(minerCoinbase)
        let senderBalAfter = await ethers.provider.getBalance(sender.address)

        return {
          minerBalDiff: minerBalAfter.sub(minerBalBefore).sub(minerReward), 
          senderBalDiff: senderBalAfter.sub(senderBalBefore)
        }
      }

      async function simulateTipMinerWithDispatcher({ tipRate, borrowAmount, profitAmount }) {

        function convertTxDataToByteCode(tx) {
          const txData = tx.data
          const dataBytes = ethers.utils.hexDataLength(txData);
          const dataBytesHex = ethers.utils.hexlify(dataBytes);
          const dataBytesPadded = ethers.utils.hexZeroPad(dataBytesHex, 32);
        
          return ethers.utils.hexConcat([
            tx.to, 
            dataBytesPadded, 
            txData
          ]).split('0x')[1]
        }
      
        async function sendDispatcherTx(signer, borrowAmount, tipRate) {
          let wrapTxCalldata = await weth.populateTransaction.deposit().then(convertTxDataToByteCode)
          let tipperTxCalldata = await tipper.populateTransaction.tip(borrowAmount, tipRate).then(convertTxDataToByteCode)
          let tradeTx = '0x' + wrapTxCalldata + tipperTxCalldata
          dispatcher.connect(signer)
          return dispatcher['makeTrade(bytes,uint256)'](
            tradeTx, 
            borrowAmount, 
            { gasPrice: '0' }
          )
        }

        // Balances before
        let senderBalBefore = await ethers.provider.getBalance(dispatcherAddress)
        // Send txs
        await mineWETH(dispatcherAddress, profitAmount)  // Simulate profit generation
        await dispatcher.connect(trader).tokenAllowAll([wethAddress], tipper.address)
        // Balances before
        let minerCoinbase = await ethers.provider.getBlock().then(blockInfo => blockInfo.miner)
        let minerBalBefore = await ethers.provider.getBalance(minerCoinbase)  // In forks miner stays the same
        await sendDispatcherTx(trader, borrowAmount, tipRate)
        // Balances after txs
        let minerBalAfter = await ethers.provider.getBalance(minerCoinbase)
        let senderBalAfter = await ethers.provider.getBalance(dispatcherAddress)

        return {
          minerBalDiff: minerBalAfter.sub(minerBalBefore).sub(minerReward), 
          senderBalDiff: senderBalAfter.sub(senderBalBefore)
        }
      }

      it('Dispatcher tx', async () => {
        let borrowAmount = ethers.utils.parseEther('10')
        let profitAmount = ethers.utils.parseEther('3')
        let tipRate = ethers.utils.parseUnits('0.2')
        
        let { minerBalDiff, senderBalDiff } = await simulateTipMinerWithDispatcher({
          profitAmount,
          borrowAmount, 
          tipRate, 
        })
        expect(minerBalDiff).to.equal(ethers.utils.parseEther('0.6'))
        expect(senderBalDiff).to.equal(ethers.utils.parseEther('2.4'))
      })

      it('Tip: 0%; Borrow: 1 ETH; Profit: 2 ETH  | Return borrowed to the sender and split profits between miner and sender', async () => {
        let borrowAmount = ethers.utils.parseEther('0')
        let profitAmount = ethers.utils.parseEther('2')
        let tipRate = ethers.utils.parseUnits('0')
        let sender = accounts[4]
        
        let { minerBalDiff, senderBalDiff } = await simulateTipMiner({sender,tipRate, borrowAmount, profitAmount})
        expect(minerBalDiff).to.equal(ethers.utils.parseEther('0'))
        expect(senderBalDiff).to.equal(ethers.utils.parseEther('2'))
      })

      it('Tip: 50%; Borrow: 0 ETH; Profit: 1 ETH  | Return borrowed to the sender and split profits between miner and sender', async () => {
        let borrowAmount = ethers.utils.parseEther('0')
        let profitAmount = ethers.utils.parseEther('1')
        let tipRate = ethers.utils.parseUnits('0.5')
        let sender = accounts[4]
        
        let { minerBalDiff, senderBalDiff } = await simulateTipMiner({sender,tipRate, borrowAmount, profitAmount})
        expect(minerBalDiff).to.equal(ethers.utils.parseEther('0.5'))
        expect(senderBalDiff).to.equal(ethers.utils.parseEther('0.5'))
      })

      it('Tip: 100%; Borrow: 1 ETH; Profit: 2 ETH  | Return borrowed to the sender and split profits between miner and sender', async () => {
        let borrowAmount = ethers.utils.parseEther('1')
        let profitAmount = ethers.utils.parseEther('2')
        let tipRate = ethers.utils.parseUnits('1')
        let sender = accounts[4]
        
        let { minerBalDiff, senderBalDiff } = await simulateTipMiner({sender,tipRate, borrowAmount, profitAmount})
        expect(minerBalDiff).to.equal(ethers.utils.parseEther('2'))
        expect(senderBalDiff).to.equal(ethers.utils.parseEther('0'))
      })
      
      it('Tip: 110%; Borrow: 0 ETH; Profit: 0 ETH  | Revert with Tip exceeds max', async () => {
        let borrowAmount = ethers.utils.parseEther('0')
        let profitAmount = ethers.utils.parseEther('0')
        let tipRate = ethers.utils.parseUnits('1.1')
        let sender = accounts[5]
  
        await expect(
          simulateTipMiner({sender,tipRate, borrowAmount, profitAmount})
        ).to.be.revertedWith('Tip exceeds max')
      })

      it('Tip: 50%; Borrow: 2 ETH; Profit: 1 ETH | Revert with Sender wETH shortage', async () => {
        let borrowAmount = ethers.utils.parseEther('2')
        let profitAmount = ethers.utils.parseEther('1')
        let tipRate = ethers.utils.parseUnits('0.5')
        let wrapAmount = ethers.utils.parseEther('0')
        let sender = accounts[6]
  
        await expect(
          simulateTipMiner({sender,tipRate, borrowAmount, profitAmount, wrapAmount})
        ).to.be.revertedWith('Sender wETH shortage')
      })

      it('Tip: 10%; Borrow: 0 ETH; Profit: 2 ETH; Min tip is 50% | Revert with Even the Titanic tipped', async () => {
        let borrowAmount = ethers.utils.parseEther('0')
        let profitAmount = ethers.utils.parseEther('2')
        let tipRate = ethers.utils.parseUnits('0.1')
        let sender = accounts[7]

        await tipper.connect(owner).setMinTipRate('500000000000000000')
  
        await expect(
          simulateTipMiner({sender,tipRate, borrowAmount, profitAmount})
        ).to.be.revertedWith('Tip too low')
      })

  })

});
