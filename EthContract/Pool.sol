pragma solidity ^0.5.16;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Pool {
    mapping (address => uint) public players; 
    uint public pool;
    // Retrieve LendingPool address
    LendingPoolAddressesProvider provider = LendingPoolAddressesProvider(address(0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5)); // Kovan address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    LendingPool lendingPool = LendingPool(provider.getLendingPool());
    address ethAddress = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // Kovan ETH address
    
    /// Instantiation of the aToken address
    aToken aTokenInstance = AToken(0xD483B49F2d55D2c53D32bE6efF735cB001880F79); //aETH address on Kovan network

    constructor() public {
        manager = msg.sender;
        
    }

    function enter(address conflux_add) public payable {
        players[conflux_add] = msg.value;
    }

    function del(address conflux_add) public {
        require(msg.sender == manager);
        delete(players[conflux_add]);
    }

    function deposit_aave(uint amount) public {
        //https://docs.aave.com/developers/developing-on-aave/the-protocol/lendingpool
        require(msg.sender == manager);
        // Approve LendingPool contract to move your DAI
        IERC20(ethAddress).approve(provider.getLendingPoolCore(), amount);
        lendingPool.deposit(ethAddress, amount, 0);
    }

    function redeem_aave(uint amount) public {
        //https://docs.aave.com/developers/developing-on-aave/the-protocol/atokens
        require(msg.sender == manager);
        aTokenInstance.redeem(amount);
    }
    
}