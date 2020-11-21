pragma solidity ^0.7.1;

import "./StarsCoins.sol";

/* goal: a contract that allow people to join and once a certain amount of people joined, 
the contract randomly select a winner and pay to the winner 
*/

contract Lottery {
    address public manager;
    address payable[] public players;
    uint lotteryId;
    
    //play with stars coins
    address payable coinContract = 0x8ADE61A7A0e8E66b479f72f896e0A525478590B1; // contract of Stars 
    StarsCoins stars = StarsCoins(coinContract);

    event AnnounceWinner(address _winner, uint _id, uint _amount);
    event CheckData(address _user, uint256 _balance, uint _inputvalue, uint256 amount);

    constructor(){
        manager = msg.sender;
        lotteryId = 1;
    }

    function enter() public payable {        
        //need to decide on CFX <=> stars conversion
        //mapping 1 to 1 ether to stars: 1 eth = 1 stars
        emit CheckData(msg.sender, stars.balanceOf(msg.sender), msg.value, (msg.value / 1e18));
        //require(msg.value == 10 * 1e18, "Lottery: Insufficient amount"); //need to finalize conversion
        require(stars.balanceOf(msg.sender) >= (1 * 1e18), "Stars: Insufficient balance");
        //require(stars.balanceOf(msg.sender) >= 10, "Stars: Insufficient balance");
        //transfer stars to this contract with amount entered.
        stars.transfer(address(this), (1 * 1e18));

        players.push(msg.sender);
        //check the number of players
        if(players.length == 5){
            pickWinner();
        }
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, players)));
    }

    function pickWinner() private{
        uint index = random() % players.length;
        
        //award winner with stars coins
        uint256 amount = stars.balanceOf(address(this));
        emit AnnounceWinner(players[index], lotteryId, amount);
        //tranfer balance to winner
        stars._fromTransfer(address(this), players[index], amount);
        
        players = new address payable[](0);
        lotteryId += 1;
    }

    function getPlayers() public view returns(address payable[] memory) {
        return players;
    }

    function getPool() public view returns(uint){
        return address(this).balance;
    }

}