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
ETH: 1 = Higher, 2 = Lower
*/

contract BinaryLottery {
    //declare required variables
    address public manager;

    address payable[] public players1;
    address payable[] public players2;
    mapping(address => uint) public bets;

    uint score1;
    uint score2;
    uint pool1;
    uint pool2;

    uint winningTeam;

    uint lotteryId;
    bool LotteryOpen;

    //play with stars coins
    address payable coinContract = 0x8CfaE18BC701B4BEF916D19F45DB0bA206dc346E;//stars
    StarsCoins stars = StarsCoins(coinContract);

    constructor(){        
        //initialize variables
        manager = msg.sender;
        lotteryId = 1;
        LotteryOpen = false;
    }

    //Sponsorship
    address swc_addr = 0x0888000000000000000000000000000000000001; //swc address
    SponsorWhitelistControl swc = SponsorWhitelistControl(swc_addr);

    //announcements
    event AnnounceWinner(uint _winningTeam, uint _id);
    event numPlayers(uint p1, uint p2);

    
    //backend call this function to start lottery
    function startLottery() public{
        require(LotteryOpen == false, "Lottery: Lottery is open.");
        require(manager == msg.sender, "Lottery: permission denied.");
        LotteryOpen = true;
        pool1 = 0;
        pool2 = 0;
    }
    
    //frontend call this function to enter lottery
    function enter(uint amount, uint _teamChosen) public{
        require(LotteryOpen == true, "Lottery: Lottery is not open.");
        //check for single entry
        //require(bets[msg.sender] == 0, "Lottery: You have already entered this lottery");
        require(stars.balanceOf(msg.sender) >= amount, "Lottery: Insufficient balance of Stars");

        //transfer stars to this contract with amount entered.
        stars._fromTransfer(msg.sender, address(this), amount);

        if (_teamChosen == 1){
            players1.push(msg.sender);
            bets[msg.sender] = amount;
            pool1 = pool1 + amount;
        }

        if (_teamChosen == 2){
            players2.push(msg.sender);
            bets[msg.sender] = amount;
            pool2 = pool2 + amount;

        }
    }

    function updateScores(uint _score1, uint _score2) private{
        score1 = _score1;
        score2 = _score2;
    }
    
    function payWinner() private{
        //close lottery
        require(LotteryOpen == false, "Lottery: Lottery is open.");
        uint amount;

        //check winning team
        if (winningTeam == 1){
            //loop thru winning players to pay them
            for (uint i = 0; i < players1.length; i++){

                //calculate prize
                amount = div(bets[players1[i]], pool1) * pool2;

                //tranfer prize to winners
                stars._fromTransfer(address(this), players1[i], amount);
            }

        }
        else{
            //loop thru winning players to pay them
            for (uint i = 0; i < players2.length; i++){

                //calculate prize
                amount = div(bets[players2[i]], pool2) * pool1;
                //amount = uint(bets[players2[i]] / pool2) * pool1;

                //tranfer prize to winners
                stars._fromTransfer(address(this), players2[i], amount);
            }
        }
       
        emit AnnounceWinner(winningTeam, lotteryId);
        
    }

    function resetLottery() private{
        //close lottery
        require(LotteryOpen == false, "Lottery: Lottery is open.");

        //loop thru players1 to reset bets
        for (uint i = 0; i < players1.length; i++){
            delete bets[players1[i]];
            //bets[players1[i]] = 0;
        }
        //loop thru players2 to reset bets
        for (uint i = 0; i < players2.length; i++){
            delete bets[players2[i]];
            //bets[players2[i]] = 0;
        }
        
        //reset variables
        players1 = new address payable[](0);
        players2 = new address payable[](0);
        pool1 = 0;
        pool2 = 0;
        lotteryId += 1;
    }

    //backend call to end lottery, pay back players and pick winner
    function endLottery(uint _score1, uint _score2) public{
        require(LotteryOpen == true, "Lottery: Lottery is not open.");
        require(manager == msg.sender, "Lottery: permission denied.");
        emit numPlayers(players1.length, players2.length);

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
    function div(uint a, uint b) internal pure returns (uint256) {
        return div(a, b, "Division by zero");
    }
    function div(uint a, uint b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function getplayers1() public view returns(address payable[] memory) {
        return players1;
    }

    function getplayers2() public view returns(address payable[] memory) {
        return players2;
    }
    
    function getLotteryId() public view returns(uint) {
        return lotteryId;
    }

    function getPool() public view returns(uint256){
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