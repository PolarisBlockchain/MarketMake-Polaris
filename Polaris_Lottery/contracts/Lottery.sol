pragma solidity ^0.7.1;
/**************************************************************************
 * *Program: BinaryLottery.sol
 * *Author: Polaris Lottery Group
 * *Version: 1.1
 * *Date: 12/02/2020
 * *Description: A no-loss lottery contract that executes after lottery 
 window closes. The contract randomly selects one winner and pays earned 
 interest amount to the winner, other players will be paid back their 
 initial lottery bets.

 * *Note: 0.01 eth = 1 stars
 **************************************************************************/
import "./StarsCoins.sol";
import "./SponsorWhitelistControl.sol";
import "./Star.sol";

contract Lottery {
    //declare required variables
    address public manager;
    address payable[] public players;
    uint lotteryId;
    bool LotteryOpen;

    //Sponsorship
    address swc_addr = 0x0888000000000000000000000000000000000001; //swc address
    SponsorWhitelistControl swc = SponsorWhitelistControl(swc_addr);

    event AnnounceWinner(address _winner, uint _id, uint _amount);

    constructor(){     
        //play with stars coins
        address payable coinContract = 0x855D31D814Dce772976cc94D1f3E2b16e08fBB80; // contract of Stars 
        StarsCoins stars = StarsCoins(coinContract);

        //initialize variables
        manager = msg.sender;
        lotteryId = 1;
        LotteryOpen = false;
    }
    
    //backend call this function to start lottery
    function startLottery() private{
        LotteryOpen = true;
    }

    //frontend call this function to enter lottery
    function enter(uint amount) public{
        require(LotteryOpen == true, "Lottery: Lottery is not open.");
        
        //mapping 1 to 1 ether to stars: 0.01 eth = 1 stars
        require(amount == 10, "Lottery: Incorrect number of Stars");
        require(stars.balanceOf(msg.sender) >= amount, "Lottery: Insufficient balance of Stars");

        //transfer stars to this contract with amount entered.
        stars._fromTransfer(msg.sender, address(this), amount);

        players.push(msg.sender);
    
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, players)));
    }

    function pickWinner(uint prize) private{
        require(LotteryOpen == false, "Lottery: Lottery is open.");

        //get random number
        uint index = random() % players.length;

        //tranfer balance to winner
        stars._fromTransfer(address(this), players[index], prize);

        emit AnnounceWinner(players[index], lotteryId, prize);
    }
    
    function paybackPlayers() private{
        require(LotteryOpen == false, "Lottery: Lottery is open.");
        
        //lottery bets
        uint256 amount = 10;
        //tranfer amount back to players
        for (uint i = 0; i < players.length; i++){
            stars._fromTransfer(address(this), players[i], amount);
        }
    }

    //backend call to end lottery, pay back players and pick winner
    function endLottery(uint prize) private{
        //close the lottery
        LotteryOpen = false;

        //pays back players initial bets
        paybackPlayers();

        //pick the winner
        pickWinner(prize);
        
        //reset players array
        players = new address payable[](0);
        
        lotteryId += 1;
    }

    //helper functions:

    function getPlayers() public view returns(address payable[] memory) {
        return players;
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

    //function enterSponsored(address payable user, uint256 amount) public{
        //mapping 1 to 1 ether to stars: 0.01 eth = 1 stars
      //  require(amount == 10, "Lottery: Incorrect number of Stars");
      //  require(stars.balanceOf(user) >= amount, "Stars: Insufficient balance");

        //transfer stars to this contract with amount entered.
      //  stars._fromTransfer(user, address(this), amount);

      //  players.push(user);
        //check the number of players
      //  if(players.length == 5){
     //       pickWinner();
     //   }
    //}

}