pragma solidity ^0.7.1;
/**************************************************************************
 * *Program: LotteryFactory.sol
 * *Author: Polaris Lottery Group
 * *Version: 1.1
 * *Date: 12/02/2020
 * *Description: A contract keeps track of lottery contracts.

 Lottery Types:
 1 = No-Loss
 2 = Binary Betting 

 **************************************************************************/
import "./Lottery.sol";
import "./BinaryLottery.sol";


contract LotteryFactory {

    address public manager;
    address[] public lotteries;

    //play with stars coins
    address payable coinContract = 0x8CfaE18BC701B4BEF916D19F45DB0bA206dc346E;//change this to our token contract
    StarsCoins stars = StarsCoins(coinContract);

    //announcements
    event newLottery(uint id, uint lottery_type);

    constructor() {
        manager = msg.sender;
    }

    //backend calls to create a lottery contract
    function create(uint lottery_type) public returns(address, uint, uint){
        require(manager == msg.sender, "LotteryFactory: permission denied.");
        uint id;

        //create lottery according to type
        if(lottery_type == 1){
            Lottery lot = new Lottery();
            id = lotteries.length;
            lotteries.push(address(lot));
        }
        if(lottery_type == 2){
            BinaryLottery lot = new BinaryLottery();
            id = lotteries.length;
            lotteries.push(address(lot));
        }
        emit newLottery(id, lottery_type);

        return (lotteries[id], id, lottery_type);
    }

    //helpers
    function getAddress(uint _id) public returns(address){
        require(manager == msg.sender, "LotteryFactory: permission denied.");
        return lotteries[_id];
    }

    function getNumDeployedLotteries() public returns(uint){
        require(manager == msg.sender, "LotteryFactory: permission denied.");
        return lotteries.length;
    }


}