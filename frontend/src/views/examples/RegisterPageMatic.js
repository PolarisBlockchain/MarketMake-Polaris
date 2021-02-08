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
import Matic from '@maticnetwork/maticjs'
import { 
  MATIC_ADDRESS, MATIC_ABI
} from '../abi/abi'


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
const matic = new Matic({
  maticProvider: "https://rpc-mumbai.matic.today",
  parentProvider: "https://goerli.infura.io/v3/75aa7935112647bc8cc49d20beafa189",
  rootChain: "0x2890bA17EfE978480615e330ecB65333b880928e",
  withdrawManager: "0x2923C8dD6Cdf6b2507ef91de74F1d5E0F11Eac53",
  depositManager: "0x7850ec290A2e2F40B82Ed962eaf30591bb5f5C96",
  registry: "0xeE11713Fe713b2BfF2942452517483654078154D",
})

const RPSContract = new web3.eth.Contract(MATIC_ABI, MATIC_ADDRESS);



class RegisterPageMatic extends React.Component {
  state = {
    squares1to6: "",
    squares7and8: "",
    ethAddress: "",
    depositEthAmount: 0,
    dropdownOpen: false,
    currentNetwork: "Eth/Matic",
    rps_selected: 2,
  };

  componentDidMount() {
    document.body.classList.toggle("register-page");
    document.documentElement.addEventListener("mousemove", this.followCursor);
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

  deposit_eth = async (t) => {
    t.preventDefault()
    console.log("getting test token");

    const token = "0x3f152B63Ec5CA5831061B2DccFb29a874C317502" // ERC20 token address
    const amount = '100000000000000000' // amount in wei
    await matic.initialize()
    //matic.setWallet("private key here")
    const from = this.state.ethAddress
    // Approve Deposit Manager contract to transfer tokens
    await matic.approveERC20TokensForDeposit(token, amount, { from, gasPrice: '10000000000' })
    // Deposit tokens
    await matic.depositERC20ForUser(token, from, amount, { from, gasPrice: '10000000000' })
  }

  play_game = async () => {
    var tx_success = false;
    const post = await RPSContract.methods.play(this.state.rps_selected).send(
      {   from: this.state.ethAddress,
          value: web3.utils.toWei("10", "ether"),
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
      

  }

  
  render() {
    
    return (
      <div>
        <IndexNavbar />
        <div className="wrapper">
          <div className="page-header">
            <div className="page-header-image" />
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0" lg="1" md="6">
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
                        <DropdownItem tag="a" href="/app/matic">Eth/Matic</DropdownItem>
                        <DropdownItem tag="a" href="/app/aave">Aave</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
                </Row>
              </Container>


              {/* <Container>
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
                        <CardTitle tag="h4">*DEX</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <p>first connect to your wallet!</p>
                        <p>ethereum address: {this.state.ethAddress}</p>
                        <MetaMaskButton onClick={this.connect_metamask}>Connect with MetaMask</MetaMaskButton>
                        
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Deposit ETH to get STAR Token on Ethereum
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
                                placeholder="amount in eth"
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

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Transfer STAR on Ethereum to STAR on Matic
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
                                placeholder="amount in star"
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

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Withdraw from STAR on Matic to get STAR on Ethereum
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
                                placeholder="amount in matic"
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

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Withdraw from STAR to ETH
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
                                placeholder="amount in matic"
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
              </Container> */}
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
                        <CardTitle tag="h4">*RPS</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <p>Configure your Wallet to Matic!</p>
                        <p>matic address: {this.state.ethAddress}</p>
                        <MetaMaskButton onClick={this.connect_metamask}>Connect with MetaMask</MetaMaskButton>
                          <Col>
                              <p className="category">Make a choice:</p>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({rps_selected: 0})}>
                                  <Input
                                    defaultValue="option1"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  Rock✊
                                </Label>
                              </FormGroup>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({rps_selected: 1})}>
                                  <Input
                                    defaultChecked
                                    defaultValue="option2"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  Paper✋
                                </Label>
                              </FormGroup>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({rps_selected: 2
                                })}>
                                  <Input
                                    defaultChecked
                                    defaultValue="option2"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                  />
                                  <span className="form-check-sign" />
                                  Scissors✌
                                </Label>
                              </FormGroup>
                
                              <br/>
                              <Button className="btn-round right" size="sm" onClick={() => this.play_game()}>
                              enter lottery
                            </Button>
                          </Col>
                      </CardBody>
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

         
           
          <Footer />
        </div>
      </div>
    );
  }
}

export default RegisterPageMatic;
