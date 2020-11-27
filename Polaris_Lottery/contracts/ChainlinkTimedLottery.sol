pragma solidity ^0.7.1;

import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.6/ChainlinkClient.sol";
import "./StarsCoins.sol";
import "./SponsorWhitelistControl.sol";
/* 
Description: a contract that allow people to join and once lottery time is up, 
the contract randomly select a winner and pay to the winner.

Reference: https://docs.chain.link/docs/chainlink-alarm-clock#config
*/

contract ChainlinkTimedLottery is ChainlinkClient {
    //initialize chainlink variables 
    uint private oraclePayment;
    address private oracle;
    bytes32 private jobId;
    
    //initialize lottery variables 
    address public manager;
    address payable[] public players;
    uint lotteryId;
    bool private LotteryOpen;

    //play with stars coins
    address payable coinContract = 0x8532d999176d2f5Ad5fc0d4D2981f53e62Ecf6B1; // contract of Stars 
    StarsCoins stars = StarsCoins(coinContract);

    //Sponsorship
    address swc_addr = 0x0888000000000000000000000000000000000001; //swc address
    SponsorWhitelistControl swc = SponsorWhitelistControl(swc_addr);

    event AnnounceWinner(address _winner, uint _id, uint _amount);

    //only the contract manager should be able to start voting
    modifier onlyManager {
    require(msg.sender == manager);
    _;
    }

     /*
     * Network: Kovan
     * Oracle: Chainlink - 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e
     * Job ID: Chainlink - 29fa9aa13bf1468788b7cc4a500a45b8
     * Fee: 0.1 LINK
     */
    constructor() public {
        setPublicChainlinkToken();
        manager = msg.sender;
        
        //if we run our node, its free 
        oraclePayment = 0.1 * 10 ** 18; // 0.1 LINK
        //Kovan alarm oracle 
        //we can put in our own node here
        oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e; 
        jobId = "a7ab70d561d34eb49e9b1612fd2e044b";
        
        //initialize lottery state
        lotteryId = 1;  
        LotteryOpen = false;
    }

    //function to start the lottery by sending request to chainlink for time keeping
    function startLottery(uint lottery_duration) public onlyManager {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        req.addUint("until", block.timestamp + lottery_duration * 1 hours);
        //Start voting window then submit request to sleep for $voteMinutes
        LotteryOpen = true;
        sendChainlinkRequestTo(oracle, req, oraclePayment);
    }

    //Callback for startLottery request
    function fulfill(bytes32 _requestId) public recordChainlinkFulfillment(_requestId) {
        //lottery_duration havs elapsed, close the lottery
        LotteryOpen = false;
        pickWinner();
    }

    function enter(uint256 amount) public payable {        
        require(LotteryOpen == true, "Lottery: Lottery is not open.");

        //mapping 1 to 1 ether to stars: 0.01 eth = 1 stars
        require(amount == 10, "Lottery: Incorrect number of Stars");
        require(stars.balanceOf(msg.sender) >= amount, "Lottery: Insufficient balance of Stars");

        //transfer stars to this contract with amount entered.
        stars._fromTransfer(msg.sender, address(this), amount);

        //add player to array
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, players)));
    }

    function pickWinner() private {
        require(LotteryOpen == false, "Lottery: Lottery is still open.");
       
        uint index = random() % players.length; 
        //award winner with stars coins
        uint256 amount = stars.balanceOf(address(this));
        emit AnnounceWinner(players[index], lotteryId, amount);
        //tranfer balance to winner
        stars._fromTransfer(address(this), players[index], amount);
        //reset players array
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