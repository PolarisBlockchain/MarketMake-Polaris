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
import { AAVE_CREDIT_DELETATION_ADDRESS, AAVE_CREDIT_DELEGATION_ABI } from '../abi/aave-abi'

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

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footer/Footer.js";

const web3 = new Web3(Web3.givenProvider);
const DelegateContract = new web3.eth.Contract(AAVE_CREDIT_DELEGATION_ABI, AAVE_CREDIT_DELETATION_ADDRESS);

class RegisterPageAave extends React.Component {
  state = {
    squares1to6: "",
    squares7and8: "",
    ethAddress: "",
    depositEthAmount: 0,
    amountOfColateral: 0,
    dropdownOpen: false,
    currentNetwork: "Aave"
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
    // const gas = await DelegateContract.methods.depositCollateral().estimateGas();
    // console.log('estimated gas: ', gas);
    // var block = await web3.eth.getBlock("latest");
    // var gasLimit = block.gasLimit/block.transactions.length;
    
    var tx_success = false;
    const post = await DelegateContract.methods.depositCollateral(this.state.ethAddress).send(
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
      console.log(this.state.depositEthAmount);
      console.log(this.state.ethAddress);
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
              <div name="dropdown-menu">
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
              </div>
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div name="background-squares">
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
                    </div>
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">lenders</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <p>First connect your ETH Wallet!</p>
                        <br/>
                        <MetaMaskButton onClick={this.connect_metamask}>Connect with MetaMask</MetaMaskButton>
                        <p></p>
                        <p>ethereum address: {this.state.ethAddress}</p>
                        <p>amount deposited: {this.state.amountOfColateral} ETH</p>
                        
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
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <div name="background-cards">
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
                </div>
              </Container>
          </div>
            
          </div>
          <div className="page-header">
            <div className="page-header-image" />
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div name="background-squares">
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
                    </div>
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">delegate</CardTitle>
                      </CardHeader>
                      <CardBody>

                        <h3>To Delegate (Delegator Only):</h3>

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            
                            The Delegatee's Address
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              
                              <Input
                                onChange={(t) => this.setState({depositEthAmount: t.target.value})}
                                placeholder="address of borrower"
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


                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Amount to delegate
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
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
                            </InputGroup>
                          </label>
                          
                        </Form>
                        <Button className="btn-round" size="sm">
                                confirm
                        </Button>
                        <p/>

                        <h3>Check Delegated:</h3>
                        
                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            The Delegator's Address
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              
                              <Input
                                onChange={(t) => this.setState({depositEthAmount: t.target.value})}
                                placeholder="address of delegator"
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

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            The Delegatee's Address
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              
                              <Input
                                onChange={(t) => this.setState({depositEthAmount: t.target.value})}
                                placeholder="address of delegatee"
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
                        <Button className="btn-round" size="sm">
                                confirm
                              </Button>
                        
                              <p>Allowance: {this.state.amountOfColateral} ETH</p>

                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <div name="background-cards">
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
                </div>
              </Container>
            </div>
          </div>
          
          
          <div className="page-header">
            <div className="page-header-image" />
            <div className="content">
              <Container>
                <Row>
                  <Col className="offset-lg-0 offset-md-3" lg="5" md="6">
                    <div name="background-squares">
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
                    </div>
                    <Card className="card-register">
                      <CardHeader>
                        <CardImg
                          alt="..."
                          src={require("assets/img/square-purple-1.png")}
                        />
                        <CardTitle tag="h4">borrow</CardTitle>
                      </CardHeader>
                      <CardBody>

                      <p>Your Borrow request should be less than the Amount Below</p>
                      <p>Allowance: {this.state.amountOfColateral} ETH</p>

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            Amount to Borrow
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
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
                            </InputGroup>
                          </label>
                          
                        </Form>

                        <Form className="form" onSubmit={this.deposit_eth}>
                          <label>
                            The Delegator's Address
                            <InputGroup
                              className={classnames({
                                "input-group-focus": this.state.passwordFocus
                              })}
                            >
                              
                              <Input
                                onChange={(t) => this.setState({depositEthAmount: t.target.value})}
                                placeholder="address of delegator"
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

                        <Button className="btn-round" size="sm">
                                confirm
                        </Button>

                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <div name="background-cards">
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
                </div>
              </Container>
            </div>
          </div>
          

          <Footer />
        </div>
      </div>
    );
  }
}

export default RegisterPageAave;
