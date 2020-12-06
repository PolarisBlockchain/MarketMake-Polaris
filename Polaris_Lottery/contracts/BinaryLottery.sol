pragma solidity ^0.7.1;
/**************************************************************************
 * *Program: BinaryLottery.sol
 * *Author: Polaris Lottery Group
 * *Version: 1.1
 * *Date: 12/02/2020
 * *Description: A contract that allows players to place a bet in one of 
 two choices given. 
 
 * *Note: 0.01 eth = 1 stars
 **************************************************************************/
import "./StarsCoins.sol";
import "./SponsorWhitelistControl.sol";

/*
NBA: 1 = Home Team, 2 =  Visitor Team
ETH: 1 = True, 2 = False
*/

contract BinaryLottery {
    //declare required variables
    address public manager;

    address payable[] public players1;
    address payable[] public players2;
    mapping(address => uint) public bets;

    uint score1;
    uint score2;

    uint winningTeam;

    uint lotteryId;
    bool LotteryOpen;

    address payable coinContract;

    constructor(address payable _coinContract){
        coinContract = _coinContract; // contract of Stars 
        
        //initialize variables
        manager = msg.sender;
        lotteryId = 1;
        LotteryOpen = false;
    }
    //play with stars coins 
    StarsCoins stars = StarsCoins(coinContract);

    //Sponsorship
    address swc_addr = 0x0888000000000000000000000000000000000001; //swc address
    SponsorWhitelistControl swc = SponsorWhitelistControl(swc_addr);

    //announcements
    event AnnounceWinner(uint _winningTeam, uint _id, uint _amount);

    
    //backend call this function to start lottery
    function startLottery() private{
        require(manager == msg.sender, "Lottery: permission denied.");
        LotteryOpen = true;
    }
    
    //frontend call this function to enter lottery
    function enter(uint amount, uint _teamChosen) public{
        require(LotteryOpen == true, "Lottery: Lottery is not open.");
        
        //fixed bet
        require(amount == 10, "Lottery: Incorrect number of Stars");
        require(stars.balanceOf(msg.sender) >= amount, "Lottery: Insufficient balance of Stars");

        //transfer stars to this contract with amount entered.
        stars._fromTransfer(msg.sender, address(this), amount);

        if (_teamChosen == 1){
            players1.push(msg.sender);
            bets[msg.sender] = amount;
        }

        if (_teamChosen == 2){
            players2.push(msg.sender);
            bets[msg.sender] = amount;
        }
    }

    function updateScores(uint _score1, uint _score2) public{
        score1 = _score1;
        score2 = _score2;
    }
    
    function payWinner() private{
        //close lottery
        require(LotteryOpen == false, "Lottery: Lottery is open.");
        address payable[] memory winners;
        uint amount;

        //check winning team
        if (winningTeam == 1){
            //set winners to players1
            winners = players1;
            //calculate prize
            amount = uint(players2.length * 10) / players1.length;
        }
        else{
            //set winners to players2
            winners = players2;
            //calculate prize
            amount = uint(players1.length * 10) / players2.length;
        }

        //loop thru winning players to pay them
        for (uint i = 0; i < winners.length; i++){
            //tranfer prize to winners
            stars._fromTransfer(address(this), winners[i], amount);
        }
       
        emit AnnounceWinner(winningTeam, lotteryId, amount);
        
    }

    function resetLottery() private{
        //close lottery
        require(LotteryOpen == false, "Lottery: Lottery is open.");

        //loop thru players1 to reset bets
        for (uint i = 0; i < players1.length; i++){
            bets[players1[i]] = 0;
        }
        //loop thru players2 to reset bets
        for (uint i = 0; i < players2.length; i++){
            bets[players2[i]] = 0;
        }
        
        //reset arrays
        players1 = new address payable[](0);
        players2 = new address payable[](0);
        lotteryId += 1;
    }

    //backend call to end lottery, pay back players and pick winner
    function endLottery(uint _score1, uint _score2) private{
        require(manager == msg.sender, "Lottery: permission denied.");

        //close the lottery
        LotteryOpen = false;

        //update scores
        updateScores(_score1, _score2);

        //update winning team
        if (score1 > score2){
            winningTeam = 1;
        }
        else{
            winningTeam = 2;
        }

        //pay the winning players
        payWinner();
        
        //reset lottery setting for next round
        resetLottery();

    }

    //helper functions:

    function getplayers1() public view returns(address payable[] memory) {
        return players1;
    }

    function getplayers2() public view returns(address payable[] memory) {
        return players2;
    }
    
    function getLotteryId() public view returns(uint) {
        return lotteryId;
    }

    function getPool() public view returns(uint){
        return stars.balanceOf(address(this));
    }

    function getLotteryOpen() public view returns(bool){
        return LotteryOpen;
    }

    function addToWhitelist(address account) public {
        require(msg.sender == manager, "Lottery: Only manager can access");
        address[] memory a = new address[](1);
        //a[0] = 0x0000000000000000000000000000000000000000; //all trans will be sponsored
        a[0] = account; //sponsor specific user
        swc.addPrivilege(a);
    }

}