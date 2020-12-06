  
pragma solidity ^0.5.0;

//import "https://github.com/mrdavey/ez-flashloan/blob/remix/contracts/aave/FlashLoanReceiverBase.sol";
import "https://github.com/mrdavey/ez-flashloan/blob/remix/contracts/aave/ILendingPool.sol";
import "https://github.com/mrdavey/ez-flashloan/blob/remix/contracts/aave/ILendingPoolAddressesProvider.sol";
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

//integrate aave:  https://soliditydeveloper.com/integrate-aave
interface IaToken {
    function balanceOf(address _user) external view returns (uint256);
    function redeem(uint256 _amount) external;
}


contract PoolNew {
    address payable manager;
    mapping (address => uint) public players; 
    address constant AaveLendingPoolAddressProviderAddress =0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5;// Kovan address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    //uint public pool;
    // Retrieve LendingPool address
    //LendingPoolAddressesProvider provider = LendingPoolAddressesProvider(address(0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5)); // Kovan address, for other addresses: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances
    //LendingPool lendingPool = LendingPool(provider.getLendingPool());
    //ILendingPool lendingPool = ILendingPool(
    //        ILendingPoolAddressesProvider(AaveLendingPoolAddressProviderAddress)
    //            .getLendingPool()
    //);
    ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(address(0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5));
    ILendingPool lendingPool = ILendingPool(provider.getLendingPool());

    address ethAddress = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // Kovan ETH address
    address daiAddress = address(0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa); // Kovan Dai address
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
        //IERC20(ethAddress).approve(ILendingPoolAddressesProvider(AaveLendingPoolAddressProviderAddress).getLendingPoolCore(), amount);
        //IERC20(ethAddress).approve(provider.getLendingPoolCore(), amount);
        //IERC20(ethAddress).approve(provider.getLendingPoolCore(), amount);
        //lendingPool.deposit(ethAddress, amount, 0);
        //lendingPool.deposit{ value: amount }(reserve, amount, 0);
        lendingPool.deposit.value(amount)(ethAddress, amount, 0);
    }



    function redeem_aave(uint amount) public {
        //https://docs.aave.com/developers/developing-on-aave/the-protocol/atokens
        require(msg.sender == manager);
        //require(amount <= aTokenInstance.balanceOf(address(this)));
        aTokenInstance.redeem(amount);
    }
    
}