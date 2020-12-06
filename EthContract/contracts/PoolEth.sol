  
pragma solidity ^0.5.0;



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

contract ILendingPoolAddressesProvider {

    function getLendingPool() public view returns (address);
    function setLendingPoolImpl(address _pool) public;

    function getLendingPoolCore() public view returns (address payable);
    function setLendingPoolCoreImpl(address _lendingPoolCore) public;

    function getLendingPoolConfigurator() public view returns (address);
    function setLendingPoolConfiguratorImpl(address _configurator) public;

    function getLendingPoolDataProvider() public view returns (address);
    function setLendingPoolDataProviderImpl(address _provider) public;

    function getLendingPoolParametersProvider() public view returns (address);
    function setLendingPoolParametersProviderImpl(address _parametersProvider) public;

    function getTokenDistributor() public view returns (address);
    function setTokenDistributor(address _tokenDistributor) public;

    function getFeeProvider() public view returns (address);
    function setFeeProviderImpl(address _feeProvider) public;

    function getLendingPoolLiquidationManager() public view returns (address);
    function setLendingPoolLiquidationManager(address _manager) public;

    function getLendingPoolManager() public view returns (address);
    function setLendingPoolManager(address _lendingPoolManager) public;

    function getPriceOracle() public view returns (address);
    function setPriceOracle(address _priceOracle) public;

    function getLendingRateOracle() public view returns (address);
    function setLendingRateOracle(address _lendingRateOracle) public;

}

interface ILendingPool {
  function addressesProvider () external view returns ( address );
  function deposit ( address _reserve, uint256 _amount, uint16 _referralCode ) external payable;
  function redeemUnderlying ( address _reserve, address _user, uint256 _amount ) external;
  function borrow ( address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode ) external;
  function repay ( address _reserve, uint256 _amount, address _onBehalfOf ) external payable;
  function swapBorrowRateMode ( address _reserve ) external;
  function rebalanceFixedBorrowRate ( address _reserve, address _user ) external;
  function setUserUseReserveAsCollateral ( address _reserve, bool _useAsCollateral ) external;
  function liquidationCall ( address _collateral, address _reserve, address _user, uint256 _purchaseAmount, bool _receiveAToken ) external payable;
  function flashLoan ( address _receiver, address _reserve, uint256 _amount, bytes calldata _params ) external;
  function getReserveConfigurationData ( address _reserve ) external view returns ( uint256 ltv, uint256 liquidationThreshold, uint256 liquidationDiscount, address interestRateStrategyAddress, bool usageAsCollateralEnabled, bool borrowingEnabled, bool fixedBorrowRateEnabled, bool isActive );
  function getReserveData ( address _reserve ) external view returns ( uint256 totalLiquidity, uint256 availableLiquidity, uint256 totalBorrowsFixed, uint256 totalBorrowsVariable, uint256 liquidityRate, uint256 variableBorrowRate, uint256 fixedBorrowRate, uint256 averageFixedBorrowRate, uint256 utilizationRate, uint256 liquidityIndex, uint256 variableBorrowIndex, address aTokenAddress, uint40 lastUpdateTimestamp );
  function getUserAccountData ( address _user ) external view returns ( uint256 totalLiquidityETH, uint256 totalCollateralETH, uint256 totalBorrowsETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor );
  function getUserReserveData ( address _reserve, address _user ) external view returns ( uint256 currentATokenBalance, uint256 currentUnderlyingBalance, uint256 currentBorrowBalance, uint256 principalBorrowBalance, uint256 borrowRateMode, uint256 borrowRate, uint256 liquidityRate, uint256 originationFee, uint256 variableBorrowIndex, uint256 lastUpdateTimestamp, bool usageAsCollateralEnabled );
  function getReserves () external view;
}
//integrate aave:  https://soliditydeveloper.com/integrate-aave
interface IaToken {
    function balanceOf(address _user) external view returns (uint256);
    function redeem(uint256 _amount) external;
}


contract PoolNew {
    function() external payable{}
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
    address usdcAddress = address(0xe22da380ee6B445bb8273C81944ADEB6E8450422); // Kovan usdc address
    /// Instantiation of the aToken address
    //aToken aTokenInstance = AToken(0xD483B49F2d55D2c53D32bE6efF735cB001880F79); //aETH address on Kovan network
    address aethAddress = address(0xD483B49F2d55D2c53D32bE6efF735cB001880F79); 
    IaToken aTokenInstance = IaToken(aethAddress);
    //IaToken aTokenInstance = IaToken(0x02F626c6ccb6D2ebC071c068DC1f02Bf5693416a);

    constructor() public {
        
        manager = msg.sender;
        
        
    }

    //function enter(address conflux_add) public payable {
        
    //    players[conflux_add] = msg.value;
    //}
    function enter(address conflux_add) external payable {
        //ERC20(usdcAddress).transferFrom(msg.sender,address(this), amount);
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
        //ERC20(usdcAddress).approve(provider.getLendingPoolCore(), amount);
        uint16 referral = 0;
        //lendingPool.deposit(usdcAddress, amount, referral);
        //lendingPool.deposit(ethAddress, amount, 0);
        //lendingPool.deposit{ value: amount }(reserve, amount, 0);
        lendingPool.deposit.value(amount)(ethAddress, amount, referral);
    }



    function redeem_aave(uint amount) public payable{
        //https://docs.aave.com/developers/developing-on-aave/the-protocol/atokens
        require(msg.sender == manager);
        //require(amount <= aTokenInstance.balanceOf(address(this)));
        IaToken(aethAddress).redeem(amount);
    }
    
}