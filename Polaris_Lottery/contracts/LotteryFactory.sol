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
    address payable coinContract = 0x0888000000000000000000000000000000000001;
    StarsCoins stars = StarsCoins(coinContract);

    //announcements
    event newLottery(uint id, uint lottery_type);

    constructor() {
        manager = msg.sender;
    }

    function create(uint lottery_type) public{
        require(manager == msg.sender, "LotteryFactory: permission denied.");
        uint id;

        //create lottery according to type
        if(lottery_type == 1){
            Lottery lot = new Lottery(coinContract);
            id = lotteries.length;
            lotteries.push(address(lot));
        }
        if(lottery_type == 2){
            BinaryLottery lot = new BinaryLottery(coinContract);
            id = lotteries.length;
            lotteries.push(address(lot));
        }
        emit newLottery(id, lottery_type);
    }


}