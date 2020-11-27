pragma solidity ^0.7.1;

<<<<<<< HEAD
import "./StarsCoins.sol";
import "./SponsorWhitelistControl.sol";
=======
import "./Star.sol";

>>>>>>> c12575634bad1033c3832dc94ec243532e208efa
/* goal: a contract that allow people to join and once a certain amount of people joined, 
the contract randomly select a winner and pay to the winner 
*/

contract Lottery {
    address public manager;
    address payable[] public players;
    uint lotteryId;
    
    //play with stars coins
    address payable coinContract = 0x855D31D814Dce772976cc94D1f3E2b16e08fBB80; // contract of Stars 
    StarsCoins stars = StarsCoins(coinContract);

    //Sponsorship
    address swc_addr = 0x0888000000000000000000000000000000000001; //swc address
    SponsorWhitelistControl swc = SponsorWhitelistControl(swc_addr);

    event AnnounceWinner(address _winner, uint _id, uint _amount);
    //event CheckData(address _user, uint256 _balance, uint256 amount);

    constructor(){
        manager = msg.sender;
        lotteryId = 1;
    }

    function enter(uint256 amount) public{        
        //mapping 1 to 1 ether to stars: 0.01 eth = 1 stars
        require(amount == 10, "Lottery: Incorrect number of Stars");
        require(stars.balanceOf(msg.sender) >= amount, "Lottery: Insufficient balance of Stars");

        //transfer stars to this contract with amount entered.
        stars._fromTransfer(msg.sender, address(this), amount);

        players.push(msg.sender);
        //check the number of players
        if(players.length == 5){
            pickWinner();
        }

        //emit CheckData(msg.sender, stars.balanceOf(msg.sender), amount);
    }

    function enterSponsored(address payable user, uint256 amount) public{
        //mapping 1 to 1 ether to stars: 0.01 eth = 1 stars
        require(amount == 10, "Lottery: Incorrect number of Stars");
        require(stars.balanceOf(user) >= amount, "Stars: Insufficient balance");

        //transfer stars to this contract with amount entered.
        stars._fromTransfer(user, address(this), amount);

        players.push(user);
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
        return stars.balanceOf(address(this));
    }

    function addToWhitelist(address account) public {
        require(msg.sender == manager, "Lottery: Only manager can access");
        address[] memory a = new address[](1);
        //a[0] = 0x0000000000000000000000000000000000000000; //all trans will be sponsored
        a[0] = account; //sponsor specific user
        swc.addPrivilege(a);
    }

}