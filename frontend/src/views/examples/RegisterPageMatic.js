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
  ETH_Pool_Address, ETH_Pool_ABI,
  StarsCoins_Address, StarsCoins_ABI,
  Lottery_Address, Lottery_ABI,
  BinaryLottery_Address, BinaryLottery_ABI,
  LotteryFactory_Address, LotteryFactory_ABI,
  Disclaimer
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
const PoolContract = new web3.eth.Contract(ETH_Pool_ABI, ETH_Pool_Address);



class RegisterPageMatic extends React.Component {
  state = {
    squares1to6: "",
    squares7and8: "",
    ethAddress: "",
    depositEthAmount: 0,
    dropdownOpen: false,
    currentNetwork: "Matic",
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
    t.preventDefault();
    console.log('depositing eth...', this.state.depositEthAmount);
    const gas = await PoolContract.methods.enter("this.state.confluxAddress").estimateGas();
    var block = await web3.eth.getBlock("latest");
    var gasLimit = block.gasLimit/block.transactions.length;
    
    var tx_success = false;
    const post = await PoolContract.methods.enter("this.state.confluxAddress").send(
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
    }
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
                        <DropdownItem tag="a" href="/app/conflux">Conflux</DropdownItem>
                        <DropdownItem tag="a" href="/app/matic">Matic</DropdownItem>
                        <DropdownItem tag="a" href="/app/aave">Aave</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Col>
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
                        <CardTitle tag="h4">*RPS</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <p>ethereum address: {this.state.ethAddress}</p>
                        <MetaMaskButton onClick={this.connect_metamask}>Connect with MetaMask</MetaMaskButton>
                        
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Deposit
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
                            Withdraw
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

                          <Col>
                              <p className="category">Make a choice:</p>
                              <FormGroup check className="form-check-radio">
                                <Label check onClick={() => this.setState({nba_selected_team: 1})}>
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
                                <Label check onClick={() => this.setState({nba_selected_team: 2})}>
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
                                <Label check onClick={() => this.setState({nba_selected_team: 3})}>
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
                              <Button className="btn-round right" size="sm" onClick={() => this.enter_nba_lottery()}>
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
