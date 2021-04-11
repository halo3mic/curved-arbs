pragma solidity ^0.8.0;

interface ITipJar {
    function tip() external payable;
}

interface IWETH {
    function transferFrom(address src, address dst, uint value) external returns (bool);
    function withdraw(uint) external;
    function balanceOf(address) view external returns (uint256);
}

// Helper methods for interacting with ERC20 tokens and sending ETH that do not consistently return true/false
library TransferHelper {

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }
}

contract DispatcherTipper {
    address constant public TipJar = 0x5312B0d160E16feeeec13437a0053009e7564287;
    address constant public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint256 constant public TIP_RATE_UNIT = 1000000000000000000;  // 1e18
    uint256 public MIN_TIP_RATE = 0;
    address public OWNER;

    constructor() {
        OWNER = msg.sender;
    }

    function setMinTipRate(uint256 _MIN_TIP_RATE) external {
        require(msg.sender==OWNER, 'Not owner');
        require(_MIN_TIP_RATE <= TIP_RATE_UNIT, 'Tip to big');
        MIN_TIP_RATE = _MIN_TIP_RATE;
    }

    /*
     * Function unwraps sender's WETH balance and splits ETH among TipJar and dispatcher
     * borrowAmount: amount of ETH the Trader used to execute the opportunity
     * tipRate: The percentage of profit opportunity made sent to the TipJar
    */
    function tip(uint256 borrowAmount, uint256 tipRate) external {
        uint256 senderWETH = IWETH(WETH).balanceOf(msg.sender);
        require(tipRate>=MIN_TIP_RATE, 'Tip too low');
        require(tipRate<=TIP_RATE_UNIT, 'Tip exceeds max');
        require(senderWETH>=borrowAmount, 'Sender wETH shortage');
        TransferHelper.safeTransferFrom(WETH, msg.sender, address(this), senderWETH);
        IWETH(WETH).withdraw(senderWETH);
        uint256 profitShare = (senderWETH - borrowAmount) * tipRate / TIP_RATE_UNIT;
        TransferHelper.safeTransferETH(msg.sender, senderWETH-profitShare);  // Return borrowed ETH + % of profit to the dispatcher
        ITipJar(TipJar).tip{value: profitShare}();  // Send % of profit to the TipJar
    }

    receive() external payable {}
}