/*!

=========================================================
* BLK Design System React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/blk-design-system-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/blk-design-system-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import classnames from "classnames";
import Web3 from "web3";
import { Conflux } from 'js-conflux-sdk';
import { 
  ETH_Pool_Address, ETH_Pool_ABI,
  StarsCoins_Address, StarsCoins_ABI,
  Lottery_Address, Lottery_ABI,
  BinaryLottery_Address, BinaryLottery_ABI,
  LotteryFactory_Address, LotteryFactory_ABI,
  Disclaimer
} from '../abi/abi'

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Countdown from 'react-countdown';
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImg,
  CardTitle,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col
} from "reactstrap";
import { MetaMaskButton } from 'rimble-ui';
import Popup from 'reactjs-popup';

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footer/Footer.js";


const web3 = new Web3(Web3.givenProvider);
const PoolContract = new web3.eth.Contract(ETH_Pool_ABI, ETH_Pool_Address);

const conflux_node = new Conflux({
  url: "http://test.confluxrpc.org",
  defaultGasPrice: 100, // The default gas price of your following transactions
  defaultGas: 1000000, // The default gas of your following transactions
  logger: console,
});

const conflux_portal = new Conflux({

})

const cfx_sender = conflux_node.wallet.addPrivateKey(process.env.REACT_APP_CFX_PRIVATE_KEY);


const StarCoinContract = {
  name: 'StarCoin',
  contract: conflux_node.Contract({
    abi: StarsCoins_ABI,
    address: StarsCoins_Address,
  }),
}

const LotteryContract = {
  name: 'Lottery',
  contract: conflux_node.Contract({
    abi: Lottery_ABI,
    address: Lottery_Address,
  }),
}

const LotteryFactoryContract = {
  name: 'LotteryFactory',
  contract: conflux_node.Contract({
    abi: LotteryFactory_ABI,
    address: LotteryFactory_Address,
  }),
}

//same contract as above, just with different node
const NoLossLottery = new conflux_portal.Contract({
  abi: Lottery_ABI,
  address: Lottery_Address,
})

const NBALottery = new conflux_portal.Contract({
  abi: BinaryLottery_ABI,
  address: BinaryLottery_Address,
})



const mint_star_token = async (conflux_account, amount) => {
  console.log('minting STAR token to user... ', amount);
  console.log('address: ', conflux_account);

  const txhash = await StarCoinContract.contract._mint(conflux_account, amount, 0).sendTransaction({
      from: cfx_sender.address,
  });
  console.log("txhash: ", txhash);
}

class RegisterPageMatic extends React.Component {
  state = {
    squares1to6: "",
    squares7and8: "",
    ethAddress: "",
    confluxAddress: "",
    depositEthAmount: 0,
    display_no_loss_info: false,
    star_token_amount: 0,
    lottery_num_people: "",
    lottery_pool_amount: "",
    timer_second: 3000,
    eth_timer_second: 3600,
    no_loss_num_players: "",
    no_loss_pool_amount: "",
    no_loss_star_in_pool: "",
    nba_game_home_full: "",
    nba_game_home_short: "",
    nba_game_visitor_full: "",
    nba_game_visitor_short: "",
    nba_date: "",
    nba_time: "",
    nba_bet_amount: 0,
    nba_selected_team: 2,
    custom_lottery_question: "",
    custom_lottery_answer: 2,
    custom_lottery_address: "",
    play_lottery_id: "",
    play_lottery_time: "",
    play_lottery_players: 0,
    play_lottery_pool: 0,
    play_lottery_question: "",
    no_loss_lottery_winner: "",
    dropdownOpen: false,
    currentNetwork: "Conflux"
  };

  componentDidMount() {
    document.body.classList.toggle("register-page");
    document.documentElement.addEventListener("mousemove", this.followCursor);
    //start the timer
    this.update_timer();
    this.update_eth_timer();
  }

  update_timer = () => {
    if(this.state.timer_second > 0){
      setTimeout(()=>{
        this.setState((state, props) => ({
          timer_second: state.timer_second - 1
        }));
        this.update_timer()
      }, 1000)
    }
    else{
      this.setState({timer_second: 3000 })
      this.update_timer();
    }
  }

  update_eth_timer = () => {
    if(this.state.eth_timer_second > 0){
      setTimeout(()=>{
        this.setState((state, props) => ({
          eth_timer_second: state.eth_timer_second - 1
        }));
        this.update_eth_timer()
      }, 1000)
    }
    else{
      this.setState({eth_timer_second: 3600 })
      this.update_eth_timer();
    }
  }

  componentWillUnmount() {
    document.body.classList.toggle("register-page");
    document.documentElement.removeEventListener(
      "mousemove",
      this.followCursor
    );
  }
  followCursor = event => {
    let posX = event.clientX - window.innerWidth / 2;
    let posY = event.clientY - window.innerWidth / 6;
    this.setState({
      squares1to6:
        "perspective(500px) rotateY(" +
        posX * 0.05 +
        "deg) rotateX(" +
        posY * -0.05 +
        "deg)",
      squares7and8:
        "perspective(500px) rotateY(" +
        posX * 0.02 +
        "deg) rotateX(" +
        posY * -0.02 +
        "deg)"
    });
  };

  connect_metamask = async () => {
    console.log('connecting to metamask...');
    const accounts = await window.ethereum.enable();
    this.setState({
      ethAddress: accounts[0]
    }, ()=>{
      console.log("eth: ", this.state.ethAddress);
    });
  }

  connect_conflux_portal = async () => {
    console.log('connecting to conflux portal...');
    const accounts = await window.conflux.enable();
    this.setState({
      confluxAddress: accounts[0]
    }, ()=>{
      console.log("cfx: ", this.state.confluxAddress);
    });
  }

  deposit_eth = async (t) => {
    t.preventDefault();
    console.log('depositing eth...', this.state.depositEthAmount);
    const gas = await PoolContract.methods.enter(this.state.confluxAddress).estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    
    var tx_success = false;
    const post = await PoolContract.methods.enter(this.state.confluxAddress).send(
        {   from: this.state.ethAddress,
            //gas: gas,
            //gasLimit: gasLimit,
            value: web3.utils.toWei(this.state.depositEthAmount, "ether"),
        }, 
        function (err, res) {
            if (err) {
                console.log("An error occured", err)
                return
            }
            tx_success = true;
            console.log("success!!!!");
            console.log("Hash of the transaction: " + res)
        }
    );

    if(tx_success){
      //release STAR token to user
      console.log(this.state.depositEthAmount);
      console.log(this.state.confluxAddress);
      mint_star_token(this.state.confluxAddress, this.state.depositEthAmount * Math.pow(10, 2))
      this.checkStarBalance();
    }
  }

  checkStarBalance = async () => {
    console.log('checking STAR balance');
    const txhash = await StarCoinContract.contract.balanceOf(this.state.confluxAddress).call();
    console.log("txhash: ", txhash);
    this.setState({star_token_amount: txhash});
  }

  getNoLossLotteryStats = async (t) => {
      t.preventDefault()
      console.log('getting lottery stats');
      const players = await LotteryContract.contract.getPlayers().call();
      console.log(players);
      this.setState({
        no_loss_num_players: players.length,
        no_loss_pool_amount: players.length*10
      })
      // const pool = await LotteryContract.contract.getPool().call();
      // console.log(pool);
  }

  endNoLossLotteryRound = async () => {
    console.log('ending this round of lottery!');
    //send transaction to contract
    //start a new round of lottery
    //reset timer
  }

  // count_down_renderer = ({ hours, minutes, seconds, completed }) => {
  //   if(completed){
  //     console.log('setting new counter');
  //     return(
  //       <Countdown date={Date.now() + 600000} 
  //                             onComplete={()=>this.endNoLossLotteryRound()}
  //                             renderer={this.count_down_renderer}
  //                             autoStart={true}
  //       />
  //     )
  //   }
  //   return(
  //     <div>
  //       <span>{hours}h : {minutes}m : {seconds}s</span>
  //     </div>
  //   )
  // }

  display_message = () => {
    //t.preventDefault()
    console.log('changing message...');
    this.setState((state, props) => ({
      display_no_loss_info: !state.display_no_loss_info
    }));
  }

  enter_no_loss_lottery = async () => {
    console.log("entering user to no loss lottery...");

    const tx = NoLossLottery.enter(10);
    const transactionParameters = {
      gasPrice: '0x09184e72a000', // customizable by user during ConfluxPortal confirmation.
      gas: '0x186A0',  // customizable by user during ConfluxPortal confirmation.
      to: NoLossLottery.address, // Required except during contract publications.
      from: this.state.confluxAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: tx.data, // Optional, but used for defining smart contract creation and interaction.
      storageLimit: '0x400' // used to limit the total storage usage of a transaction
    }
    
    window.conflux.sendAsync({
      method: 'cfx_sendTransaction',
      params: [transactionParameters],
      from: this.state.confluxAddress,
    }, ()=>{})
  }

  end_no_loss_lottery = async () =>{
    console.log("ending lottery...");
    //make end lottery transaction 
    const txhash = await LotteryContract.contract.endLottery(0).sendTransaction({
      from: cfx_sender.address,
      gasPrice: '0x09184e72a000', // customizable by user during ConfluxPortal confirmation.
      gas: '0x186A0',  // customizable by user during ConfluxPortal confirmation.
    });
    console.log("txhash: ", txhash);

    //start a new round of lottery
    // const tx = await LotteryContract.contract.startLottery().sendTransaction({
    //   from: cfx_sender.address,
    //   gasPrice: '0x09184e72a000', // customizable by user during ConfluxPortal confirmation.
    //   gas: '0x186A0',  // customizable by user during ConfluxPortal confirmation.
    // });
    // console.log("txhash: ", tx);

    setTimeout(()=>{
      this.setState({
        timer_second: 3600,
        no_loss_lottery_winner: `recent winner: ${this.state.confluxAddress}`
      });
    }, 5000);
  }

  fetch_NBA_Info = async () => {
    axios.get('http://localhost:5001/api/v1/nba/demo')
         .then(response => {
            console.log(response.data);
            this.setState({
              nba_game_home_full: response.data.hTeam.fullName,
              nba_game_home_short: response.data.hTeam.shortName,
              nba_game_visitor_full: response.data.vTeam.fullName,
              nba_game_visitor_short: response.data.vTeam.shortName,
              nba_date: response.data.startTimeUTC.split("T")[0],
              nba_time: response.data.startTimeUTC.split("T")[1],
            })
          })
  }

  enter_nba_lottery = async () => {
    console.log(typeof(this.state.nba_selected_team));
    console.log(typeof(parseInt(this.state.nba_bet_amount)));
    console.log(this.state.nba_selected_team);
    console.log(parseInt(this.state.nba_bet_amount));
    
    const tx = NBALottery.enter(parseInt(this.state.nba_bet_amount), this.state.nba_selected_team);
    const transactionParameters = {
      gasPrice: '0x09184e72a000', // customizable by user during ConfluxPortal confirmation.
      gas: '0x186A0',  // customizable by user during ConfluxPortal confirmation.
      to: NBALottery.address, // Required except during contract publications.
      from: this.state.confluxAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: tx.data, // Optional, but used for defining smart contract creation and interaction.
      storageLimit: '0x400' // used to limit the total storage usage of a transaction
    }
    
    window.conflux.sendAsync({
      method: 'cfx_sendTransaction',
      params: [transactionParameters],
      from: this.state.confluxAddress,
    }, ()=>{})

  }

  showDisclaimer = (e) => {
    e.preventDefault()
    var myWindow = window.open("", "Polaris Lottery Disclaimer", "width=500,height=500");
    myWindow.document.write('<title>Polaris Lottery Disclaimer</title>');
    myWindow.document.write("<p>"+Disclaimer+"</p>");
  }
  
  deploy_custom_lottery = async (e) =>{
    e.preventDefault()
    console.log(this.state.custom_lottery_question);
    console.log(this.state.custom_lottery_answer);
    //tx to deploy contract
    // const txhash = await LotteryFactoryContract.contract.create(2).sendTransaction({
    //   from: cfx_sender.address,
    // }, function(error, res){
    //   console.log("returned data");
    //   console.log(res);
    // });

    //need contract address
    const  uid = uuidv4()
    console.log("id: ", uid);
    const lottery = {
      id: uid,
      question: this.state.custom_lottery_question,
      answer: this.state.custom_lottery_answer
    }

    axios.post("http://localhost:3001/contracts", lottery)
         .then(response => {
           console.log(response);
         })

    setTimeout(()=>{
      this.setState({custom_lottery_address: uid});
    }, 3000);
  }

  get_play_lottery = (e) =>{
    e.preventDefault()
    axios.get(`http://localhost:3001/contracts/${this.state.play_lottery_id}`)
         .then(response =>{
           console.log(response.data);
           this.setState({
             play_lottery_question: response.data.question,
             play_lottery_time: "one hour",
             play_lottery_players: 0,
             play_lottery_pool: 0
           })
         })
  }
  

  render() {
    let message;
    if(this.state.display_no_loss_info == true){
      message = <label style={{fontSize: 15}}>
          This is a no-loss lottery, meaning that you won't lose any of your STAR tokens if you lose the lottery game, 
          if you win, however, you'll get extra STAR tokens :)
          <br/> 
          <pre></pre>
          This is achieved by first putting the ETH people deposited in Aave lending pool to earn interest,
          then only use the interest to pay the winner, 
          plus your transaction fees are sponsored on Conlfux!
      </label>
    }
    else{
      message = <label></label>
    }
    
    return (
      <>
        <IndexNavbar />
        <div className="wrapper">
          <div className="page-header">
            <div className="page-header-image" />
            <div className="content">
              <Container>
                <Row>
                  <Dropdown 
                    isOpen={this.state.dropdownOpen} 
                    toggle={() => {this.setState({dropdownOpen: !this.state.dropdownOpen})}}
                  >
                    <DropdownToggle caret>
                      {this.state.currentNetwork}
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem header>Choose Your Network</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem tag="a" href="/app/conflux">Conflux</DropdownItem>
                      <DropdownItem tag="a" href="/app/matic">Matic</DropdownItem>
                      <DropdownItem tag="a" href="/app/aave">Aave</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Row>
              </Container>
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">*Star</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <p>First get some STAR tokens by depositing ETH!!</p>
                        <br/>
                        <p>ethereum address: {this.state.ethAddress}</p>
                        <MetaMaskButton onClick={this.connect_metamask}>Connect with MetaMask</MetaMaskButton>
                        <p>conflux address: {this.state.confluxAddress}</p>
                        <Button color="primary" onClick={this.connect_conflux_portal}>Connect with Conflux Portal</Button>
                        
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Deposit Ether (1 STAR = 0.01 ETH)
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="tim-icons icon-lock-circle" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                onChange={(t) => this.setState({depositEthAmount: t.target.value})}
                                placeholder="amount in ether"
                                type="text"
                                onFocus={e =>
                                  this.setState({ passwordFocus: true })
                                }
                                onBlur={e =>
                                  this.setState({ passwordFocus: false })
                                }
                              />
                              <Button className="btn-round" size="sm">
                                confirm
                              </Button>
                            </InputGroup>
                          </label>
                          
                        </Form>
                      </CardBody>
                      <CardFooter>
                          <Row>
                            <pre>   You own *{this.state.star_token_amount}* STAR tokens!!  </pre>
                            
                            <Button className="btn-round right" size="sm" onClick={()=> this.checkStarBalance()}>
                              refresh
                            </Button>
                          </Row>
                      </CardFooter>
                    </Card>
                  </Col>
                </Row>
                <div className="register-bg" />
                <div
                  className="square square-1"
                  id="square1"
                  style={{ transform: this.state.squares1to6}}
                />
                <div
                  className="square square-2"
                  id="square2"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-3"
                  id="square3"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-4"
                  id="square4"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-5"
                  id="square5"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-6"
                  id="square6"
                  style={{ transform: this.state.squares1to6 }}
                />
              </Container>
            </div>
          </div>
          <div className="page-header">
            <div className="page-header-image" />
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">lottery</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Form className="form">
                          <Button className="btn-round right" size="sm" onClick={()=>this.display_message()}>
                            no-loss lottery?
                          </Button>
                          {message}
                          
                          <pre></pre>
                          <label style={{fontSize: 15}}>
                            <Row>
                              <pre>   You have *{this.state.star_token_amount}* STAR tokens!!  </pre>
                              <Button className="btn-round right" size="sm" onClick={()=>this.checkStarBalance()}>
                                refresh
                              </Button>
                            </Row>
                            <br/>
                            Each round of lottery costs 10 STARs
                            <Button className="btn-round right" size="sm" onClick={(t)=>{this.getNoLossLotteryStats(t)}}>
                              get current round info
                            </Button>
                          </label>
                          <p></p>
                          <label style={{fontSize: 15}}>
                             
                             {this.state.no_loss_num_players} players
                             <br/>
                             {this.state.no_loss_pool_amount} STARs in pool
                             <br/>
                             <pre></pre>
                             Time left: 
                             {/* <Countdown date={Date.now() + 600000} 
                              onComplete={()=>this.endNoLossLotteryRound()}
                              //renderer={this.count_down_renderer}
                             /> */}
                             {this.state.timer_second}s
                             <br/>
                             {this.state.no_loss_lottery_winner}
                          </label>
                    
                        </Form>
                      </CardBody>
                      <CardFooter>
                          <FormGroup check className="text-left">
                          
                            <Label check>
                              <Input type="checkbox" />
                              <span className="form-check-sign" />I agree to the{" "}
                              <a
                                href="#pablo"
                                onClick={(e) => {this.showDisclaimer(e)}}
                              >
                                terms and conditions
                              </a>
                              .
                            </Label>
                          </FormGroup>
                          <Row>
                            <pre>    </pre>
                            <Button className="btn-round right" onClick={()=>{this.enter_no_loss_lottery()}}>
                              enter lottery
                            </Button>
                            <Button className="btn-round right" onClick={()=>{this.end_no_loss_lottery()}}>
                              end lottery
                            </Button>
                          </Row>
                          
                      </CardFooter>
                    </Card>
                  </Col>
                </Row>
                <div className="register-bg" />
                <div
                  className="square square-1"
                  id="square1"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-2"
                  id="square2"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-3-left"
                  id="square3"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-4"
                  id="square4"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-5"
                  id="square5"
                  style={{ transform: this.state.squares1to6 }}
                />
                <div
                  className="square square-6"
                  id="square6"
                  style={{ transform: this.state.squares1to6 }}
                />
              </Container>
            </div>
          </div>
          <div className="page-header">
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">nba</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <p>*not no-loss, yes-loss lottery :p</p>
                          <pre></pre>
                          <Button className="btn-round right" size="sm" onClick={()=>this.fetch_NBA_Info()}>
                            refresh NBA game
                          </Button>
                          <br/>
                          <label style={{fontSize: 15}}>
                            Game: {this.state.nba_game_home_short} vs {this.state.nba_game_visitor_short}
                            <br/>
                            Time(UTC, 24hr): {this.state.nba_date+" "+this.state.nba_time.split('.')[0]}
                            <br/>    
                          </label>
                          <pre></pre>
                          <Col>
                              <p className="category">Pick the winning team:</p>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({nba_selected_team: 1})}>
                                  <Input
                                    defaultValue="option1"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  {this.state.nba_game_home_full}
                                </Label>
                              </FormGroup>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({nba_selected_team: 2})}>
                                  <Input
                                    defaultChecked
                                    defaultValue="option2"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  {this.state.nba_game_visitor_full}
                                </Label>
                              </FormGroup>
                            </Col>
                          <pre></pre>
                          <pre></pre>
                          <label>
                            Enter amount to bet:
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="tim-icons icon-lock-circle" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                onChange={(t) => this.setState({nba_bet_amount: t.target.value})}
                                placeholder="amount in star"
                                type="text"
                                onFocus={e =>
                                  this.setState({ passwordFocus: true })
                                }
                                onBlur={e =>
                                  this.setState({ passwordFocus: false })
                                }
                              />
                            </InputGroup>

                          </label>
                          
                        </Form>
                      </CardBody>
                      <CardFooter>
              
                          <FormGroup check className="text-left">
                            <Label check>
                              <Input type="checkbox" />
                              <span className="form-check-sign" />I agree to the{" "}
                              <a
                                href="#pablo"
                                onClick={(e) => {this.showDisclaimer(e)}}
                              >
                                terms and conditions
                              </a>
                              .
                            </Label>
                          </FormGroup>
                          <Row>
                            <pre>    </pre>
                            <Button className="btn-round right" size="lg" onClick={() => this.enter_nba_lottery()}>
                              enter lottery
                            </Button>
                          </Row>
                          
                      </CardFooter>
                    </Card>
                  </Col>
                </Row>
                <div>
                  <div
                    className="square square-1-left"
                    id="square1"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-2-left"
                    id="square2"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-3-left"
                    id="square3"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-4-left"
                    id="square4"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-5-left"
                    id="square5"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-6-left"
                    id="square6"
                    style={{ transform: this.state.squares1to6 }}
                  />
                </div>
                
              </Container>
            </div>
          </div>
          <div className="page-header">
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">eth</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <p>*not no-loss, yes-loss lottery :p</p>
                          <pre></pre>
                          <label style={{fontSize: 15}}>
                            1 ETH {'>'} 600 USD in {this.state.eth_timer_second} sec?
                            <br/>  
                          </label>
                          <pre></pre>
                          <Col>
                              <p className="category">Pick one:</p>
                              <FormGroup check className="form-check-radio">
                                <Label check>
                                  <Input
                                    defaultValue="option1"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  yes
                                </Label>
                              </FormGroup>
                              <FormGroup check className="form-check-radio">
                                <Label check>
                                  <Input
                                    defaultChecked
                                    defaultValue="option2"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  no
                                </Label>
                              </FormGroup>
                            </Col>
                          <pre></pre>
                          <pre></pre>
                          <label>
                            Enter amount to bet:
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="tim-icons icon-lock-circle" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                onChange={(t) => this.setState({nba_bet_amount: t.target.value})}
                                placeholder="amount in star"
                                type="text"
                                onFocus={e =>
                                  this.setState({ passwordFocus: true })
                                }
                                onBlur={e =>
                                  this.setState({ passwordFocus: false })
                                }
                              />
                            </InputGroup>

                          </label>
                          
                        </Form>
                      </CardBody>
                      <CardFooter>
              
                          <FormGroup check className="text-left">
                            <Label check>
                              <Input type="checkbox" />
                              <span className="form-check-sign" />I agree to the{" "}
                              <a
                                href="#pablo"
                                onClick={(e) => {this.showDisclaimer(e)}}
                              >
                                terms and conditions
                              </a>
                              .
                            </Label>
                          </FormGroup>
                          <Row>
                            <pre>    </pre>
                            <Button className="btn-round right" size="lg">
                              enter lottery
                            </Button>
                          </Row>
                          
                      </CardFooter>
                    </Card>
                  </Col>
                </Row>
                <div>
                  <div
                    className="square square-1-left"
                    id="square1"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-2-left"
                    id="square2"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-3-left"
                    id="square3"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-4-left"
                    id="square4"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-5-left"
                    id="square5"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-6-left"
                    id="square6"
                    style={{ transform: this.state.squares1to6 }}
                  />
                </div>
                
              </Container>
            </div>
          </div>
          <div className="page-header">
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">create!</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label style={{fontSize: 15}}>
                            Create your own yes-loss lottery
                            <br/>  
                          </label>
                          <pre></pre>
                          <label >
                            Enter your binary question
                          </label>
                          <InputGroup
                            className={classnames({
                              "input-group-focus": this.state.fullNameFocus
                            })}
                          >
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="tim-icons icon-single-02" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              placeholder="question with an answer of yes or no"
                              onChange={(t) => this.setState({custom_lottery_question: t.target.value})}
                              type="text"
                              onFocus={e => this.setState({ fullNameFocus: true })}
                              onBlur={e => this.setState({ fullNameFocus: false })}
                            />
                          </InputGroup>
                          <Col>
                              <p className="category">Pick the answer:</p>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({custom_lottery_answer: 1})}>
                                  <Input
                                    defaultValue="option1"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  yes
                                </Label>
                              </FormGroup>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({custom_lottery_answer: 2})}>
                                  <Input
                                    defaultChecked
                                    defaultValue="option2"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  no
                                </Label>
                              </FormGroup>
                            </Col>
                            <pre></pre>
                            <label style={{fontSize: 15}}>
                              <Button className="btn-round right" onClick={(e)=>{this.deploy_custom_lottery(e)}}>
                                deploy lottery
                              </Button>
                              <pre></pre>
                              <p>lottery id: {this.state.custom_lottery_address} </p>
                            </label>
                      
                          
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <div>
                  <div
                    className="square square-1-left"
                    id="square1"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-2-left"
                    id="square2"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-3-left"
                    id="square3"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-4-left"
                    id="square4"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-5-left"
                    id="square5"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-6-left"
                    id="square6"
                    style={{ transform: this.state.squares1to6 }}
                  />
                </div>
                
              </Container>
            </div>
          </div>
          <div className="page-header">
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div
                      className="square square-7"
                      id="square7"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <div
                      className="square square-8"
                      id="square8"
                      style={{ transform: this.state.squares7and8 }}
                    />
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">play!</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Form className="form" onSubmit={this.deposit_eth}>
                          
                          <label style={{fontSize: 15}}>
                            Play existing lottery
                          </label>
                          <pre></pre>
                          <InputGroup
                            className={classnames({
                              "input-group-focus": this.state.fullNameFocus
                            })}
                          >
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              onChange={(t) => this.setState({play_lottery_id: t.target.value})}
                              placeholder="lottery id"
                              type="text"
                              onFocus={e => this.setState({ fullNameFocus: true })}
                              onBlur={e => this.setState({ fullNameFocus: false })}
                            />
                          </InputGroup>
                          <Button className="btn-round right" size="sm" onClick={e => {this.get_play_lottery(e)}}>
                              enter 
                          </Button>
                          <pre></pre>
                          <label style={{fontSize: 15}}>
                            Question: {this.state.play_lottery_question}
                            <br/>
                            Time: {this.state.play_lottery_time}
                            <br/>
                            Players: {this.state.play_lottery_players}
                            <br/>
                            Pool: {this.state.play_lottery_pool}
                          </label>
                          <pre></pre>
                          <Col>
                              <p className="category">Choose one:</p>
                              <FormGroup check className="form-check-radio">
                                <Label check>
                                  <Input
                                    defaultValue="option1"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  yes
                                </Label>
                              </FormGroup>
                              <FormGroup check className="form-check-radio">
                                <Label check>
                                  <Input
                                    defaultChecked
                                    defaultValue="option2"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  no
                                </Label>
                              </FormGroup>
                            </Col>
                            <pre></pre>
                          <label>
                            Enter amount to bet:
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="tim-icons icon-lock-circle" />
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                onChange={(t) => this.depositEthAmount = t.target.value}
                                placeholder="amount in star"
                                type="text"
                                onFocus={e =>
                                  this.setState({ passwordFocus: true })
                                }
                                onBlur={e =>
                                  this.setState({ passwordFocus: false })
                                }
                              />
                            </InputGroup>

                          </label>
                          
                        </Form>
                      </CardBody>
                      <CardFooter>
              
                          <FormGroup check className="text-left">
                            <Label check>
                              <Input type="checkbox" />
                              <span className="form-check-sign" />I agree to the{" "}
                              <a
                                href="#pablo"
                                onClick={(e) => {this.showDisclaimer(e)}}
                              >
                                terms and conditions
                              </a>
                              .
                            </Label>
                          </FormGroup>
                          <Row>
                            <pre>    </pre>
                            <Button className="btn-round right" size="lg">
                              enter lottery
                            </Button>
                          </Row>
                          
                      </CardFooter>
                    </Card>
                  </Col>
                </Row>
                <div>
                  <div
                    className="square square-1-left"
                    id="square1"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-2-left"
                    id="square2"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-3-left"
                    id="square3"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-4-left"
                    id="square4"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-5-left"
                    id="square5"
                    style={{ transform: this.state.squares1to6 }}
                  />
                  <div
                    className="square square-6-left"
                    id="square6"
                    style={{ transform: this.state.squares1to6 }}
                  />
                </div>
                
              </Container>
            </div>
          </div>
          
          <Footer />
        </div>
      </>
    );
  }
}

export default RegisterPageMatic;
