pragma solidity ^0.7.1;
/**************************************************************************
 * *Program: RPSgame.sol
 * *Author: Polaris Blockchain Group
 * *Version: 1.0
 * *Date: 01/31/2020
 * *Description: A Rock,Paper,Scissors game contract.

 * *Note: 200 Matic tokens ~= 0.01Eth; 	10 Matic ~ 0.0005Eth ~ $0.60

 0 = Rock
 1 = Paper
 2 = Scissors
 **************************************************************************/

contract RPSgame{
    address public manager;
    address payable[] public players;
    mapping(address => uint) public wallets;
    uint GameId;
    bool GameOpen;

    uint bet = 10; //10 Matic tokens

    constructor(){
        //initialize variables
        manager = msg.sender;
        GameId = 1;
        GameOpen = false;
    }

    //annoucements
    event gamestats(uint contractPick, uint playerPick, uint pool, uint GameId);

    //manager calls this function to start Game
    function startGame() public{
        require(manager == msg.sender, "Game: permission denied.");
        GameOpen = true;
    }

    //frontend calls this function to deposit Matic tokens into RPS game
    function depositMatic(address payable player, uint amount) public{
        require(manager == msg.sender, "Game: permission denied.");
        //add player
        players.push(player);	    
	    //track player RPS wallet
        wallets[player] += amount;
    }

    function withdrawMatic(address payable player, uint amount) public {
        require(manager == msg.sender, "Game: permission denied.");
	    //track player RPS wallet
        wallets[player] -= amount;
        
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, players)));
    }

    function play(uint playerPick) public returns(uint, uint, uint){
        require(GameOpen == true, "Game: Game is not open.");
        require(wallets[msg.sender] >= bet, "Game: Insufficient balance of Matic tokens.");

        //get random number b/w 0-2
        uint contractPick = random() % 3;

        //compare
        if(contractPick == playerPick){
        //do nothing
        }
        else if(playerPick > contractPick){
            //player wins
            if(playerPick - contractPick == 1){
              wallets[msg.sender] += bet;
            }
            else{
              wallets[msg.sender] -= bet;
            }
        }
        else{
          //player loses
          if(contractPick - playerPick == 1){
            wallets[msg.sender] -= bet;
          }
          else{
            wallets[msg.sender] += bet;
          }
        }

        GameId +=1;

        //show status
        emit gamestats(contractPick, playerPick, wallets[msg.sender], GameId);

        return (contractPick, wallets[msg.sender], GameId);
    }

    //manager calls to end Game
    function endGame() public {
        require(GameOpen == true, "Game: Game is not open.");
        require(manager == msg.sender, "Game: permission denied.");
        //close the Game
        GameOpen = false;
    }
    
    
    //helper functions:

    function getPlayers() public view returns(address payable[] memory) {
        return players;
    }
    
    function getWallet() public view returns(uint) {
        return wallets[msg.sender];
    }
    
    function getGameId() public view returns(uint) {
        return GameId;
    }

    function getGameOpen() public view returns(bool){
        return GameOpen;
    }

}
