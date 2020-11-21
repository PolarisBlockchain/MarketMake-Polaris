//pragma solidity ^0.5.16;
//pragma solidity ^0.7.1;
//pragma solidity ^0.5.16;
pragma solidity ^0.5.16;
//import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
//import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@studydefi/money-legos/aave/contracts/ILendingPool.sol";
import "@studydefi/money-legos/aave/contracts/ILendingPoolAddressesProvider.sol";

//import "./IERC20.sol";
//import 'https://github.com/aave/aave-protocol/blob/master/contracts/configuration/LendingPoolAddressesProvider.sol';
//import "@studydefi/money-legos/aave/contracts/LendingPoolAddressesProvider.sol";
//import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
//import "./IERC20.sol";

//integrate aave:  https://soliditydeveloper.com/integrate-aave
interface IaToken {
    function balanceOf(address _user) external view returns (uint256);
    function redeem(uint256 _amount) external;
}


contract Pool {
    address payable manager;
    mapping (address => uint) public players; 
    address constant AaveLendingPoolAddressProviderAddress =0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5;// Kovan address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    //uint public pool;
    // Retrieve LendingPool address
    //LendingPoolAddressesProvider provider = LendingPoolAddressesProvider(address(0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5)); // Kovan address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    //LendingPool lendingPool = LendingPool(provider.getLendingPool());
    ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(AaveLendingPoolAddressProviderAddress)
                .getLendingPool()
    );

    address ethAddress = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // Kovan ETH address
    
    /// Instantiation of the aToken address
    //aToken aTokenInstance = AToken(0xD483B49F2d55D2c53D32bE6efF735cB001880F79); //aETH address on Kovan network
    IaToken aTokenInstance = IaToken(0xD483B49F2d55D2c53D32bE6efF735cB001880F79);

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


    function withdraw_eth(uint amount) public {
        require(msg.sender == manager);
        require(amount <= address(this).balance);
        manager.transfer(amount);
    }

    function deposit_aave(uint amount) public {
        //https://docs.aave.com/developers/developing-on-aave/the-protocol/lendingpool
        require(msg.sender == manager);
        require(amount <= address(this).balance);
        // Approve LendingPool contract to move your DAI
        //IERC20(ethAddress).approve(provider.getLendingPoolCore(), amount);
        IERC20(ethAddress).approve(ILendingPoolAddressesProvider(AaveLendingPoolAddressProviderAddress).getLendingPoolCore(), amount);
        lendingPool.deposit(ethAddress, amount, 0);
    }



    function redeem_aave(uint amount) public {
        //https://docs.aave.com/developers/developing-on-aave/the-protocol/atokens
        require(msg.sender == manager);
        aTokenInstance.redeem(amount);
    }
    
}