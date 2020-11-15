pragma solidity ^0.5.16;

/* goal: a contract that allow people to join and once a certain amount of people joined, 
the contract randomly select a winner and pay to the winner 
*/

contract Lottery {
    address public manager;
    address payable[] public players;
    uint lotteryId;
    
    event AnnounceWinner(address _winner, uint _id, uint _amount);

    constructor() public {
        manager = msg.sender;
        lotteryId = 1;
    }

    function enter() public payable {
        require(msg.value == 10 * 1e18);
        
        players.push(msg.sender);
        //check the number of players
        if(players.length == 5){
            pickWinner();
        }
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, players)));
    }

    

    function pickWinner() public{
        uint index = random() % players.length;
        emit AnnounceWinner(players[index], lotteryId, address(this).balance);
        players[index].transfer(address(this).balance);

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