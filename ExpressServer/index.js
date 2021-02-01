// import * from "./deployed_contract";

const express = require("express");
const bodyParser = require("body-parser");
const { Conflux } = require("js-conflux-sdk");
const cors = require('cors')
require("dotenv").config();

const BinaryLottery_Address = '0x87a982f2a7b985e2b6c3818d290425b4845381f4'

const BinaryLottery_ABI = [
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_coinContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor",
    "name": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_winningTeam",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "AnnounceWinner",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "bets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "manager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "players1",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "players2",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startLottery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_teamChosen",
        "type": "uint256"
      }
    ],
    "name": "enter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_score1",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_score2",
        "type": "uint256"
      }
    ],
    "name": "endLottery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getplayers1",
    "outputs": [
      {
        "internalType": "address payable[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getplayers2",
    "outputs": [
      {
        "internalType": "address payable[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLotteryId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPool",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLotteryOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addToWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const app = express();
app.use(cors())
const port = 5001;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const X_RAPIDAPI_KEY = process.env.X_RAPIDAPI_KEY;
const X_RAPIDAPI_HOST = process.env.X_RAPIDAPI_HOST;
const BASE_URL = "/api/v1";
const NBA_BASE_URL = "https://api-nba-v1.p.rapidapi.com/";
const BASE_COIN_PRICE_URL = "https://api.coingecko.com/api/v3" // documentation is here: https://www.coingecko.com/api/documentations/v3
const axios = require('axios');

const conflux = new Conflux({
  url: "http://test.confluxrpc.org",
  defaultGasPrice: 100, // The default gas price of your following transactions
  defaultGas: 1000000, // The default gas of your following transactions
  logger: console,
});

const account = conflux.Account(PRIVATE_KEY); // create account instance
console.log("Address: ", account.address); // 0x1bd9e9be525ab967e633bcdaeac8bd5723ed4d6b

const LotteryContract = {
  name: 'Lottery',
  abi: BinaryLottery_ABI,
  contract: conflux.Contract({
    abi: BinaryLottery_ABI,
    address: BinaryLottery_Address,
  }),
}

const COIN_LISTS = [
  { "id": "ethereum", "symbol":"eth", "name":"Ethereum" },
  { "id": "ethereum-classic", "symbol": "etc", "name": "Ethereum Classic" },
  { "id": "bitcoin", "symbol": "btc", "name": "Bitcoin" }
]

const NBA_URL_PATHS = {
  seasons: "seasons",
  seasonYear: "games/seasonYear/",
  gameDetails: "gameDetails/"
}

function getCoinPriceAxiosConfig(coinID) {
  var config = {
    method: 'get',
    url: BASE_COIN_PRICE_URL + '/coins/' + coinID,
    headers: { 
      'Cookie': '__cfduid=dd68977b238609c57b157bba9b2cc9c3a1607133993'
    }
  };

  return config;
}

function getNBAAPIAxiosConfig(subPath) {
  var config = {
    method: 'get',
    url: NBA_BASE_URL + subPath + '/',
    headers: { 
      'x-rapidapi-key': X_RAPIDAPI_KEY,
      'x-rapidapi-host': X_RAPIDAPI_HOST
    }
  };

  return config;
}

async function confluxEndLottery(score1, score2) {
  console.log("score1: ", score1, " score2: ", score2);
  const txhash = await LotteryContract.contract.endLottery(score1, score2).sendTransaction({
    from: account,
    gasPrice: '0x09184e72a000', // customizable by user during ConfluxPortal confirmation.
    gas: '0x186A0',  // customizable by user during ConfluxPortal confirmation.
  });
  console.log("txhash: ", txhash);
}

const main = () => {
  app.use(bodyParser.json());

  /**
   * Pick random game
   */
  app.get(BASE_URL + "/nba/demo", async (_, res) => {
    const year = 2019;
    let config = getNBAAPIAxiosConfig(NBA_URL_PATHS.seasonYear+year);
    const index = Math.floor(Math.random()*10);
    axios(config)
    .then(function (response) {
      const games = response.data.api.games;
      const game = {
        "gameID": games[index].gameId,
        "startTimeUTC": games[index].startTimeUTC,
        "vTeam": games[index].vTeam,
        "hTeam": games[index].hTeam
      }
      res.status(200).send(game);
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  /**
   * @api {get} /api/v1/nba/season/list List Season Years
   * @apiName list-season-years
   * @apiSuccess (200) {Number[]} years
   */
  app.get(BASE_URL + "/nba/season/list", async (_, res) => {
    let config = getNBAAPIAxiosConfig(NBA_URL_PATHS.seasons);
    axios(config)
    .then(function (response) {
      const output = response.data.api.seasons;
      res.status(200).send(output);
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  /**
   * @api {get} /api/v1/nba/season/:year Get A Season
   * @apiName get-a-season
   * @apiParam {Number} year  from `list-season-years` api
   * @apiSuccess (200) {json} Games List of Games
   */
  app.get(BASE_URL + "/nba/season/:year", async (req, res) => {
    const year = req.params.year;
    let config = getNBAAPIAxiosConfig(NBA_URL_PATHS.seasonYear+year)
    axios(config)
    .then(function (response) {
      const games = response.data.api.games;
      const output = [];
      for (let i = 0; i < games.length; i++) {
        const game = {
          "gameID": games[i].gameId,
          "startTimeUTC": games[i].startTimeUTC,
          "vTeam": games[i].vTeam,
          "hTeam": games[i].hTeam
        }
        output.push(game);
      }
      res.status(200).send(output);
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  /**
   * @api {get} /api/v1/nba/timesup/:gameID End A NBA Game
   * @apiName end-a-nba-game
   * @apiParam {String} gameID  The ID of a game, fetched from `get-a-season` api.
   * @apiSuccess (200)
   */
  app.post(BASE_URL + "/nba/timesup/:gameID", async (req, res) => {
    const gameID = req.params.gameID;
    console.log("`/nba/timesup/`", gameID);
    let config = getNBAAPIAxiosConfig(NBA_URL_PATHS.gameDetails + gameID);
    axios(config)
    .then(function (response) {
      const game = response.data.api.game[0];
      const score1 = game.hTeam.score.points;
      const score2 = game.vTeam.score.points;

      confluxEndLottery(score1, score2).then(() => {
      })
      .catch(function (error){
        console.log(error);
      })
      res.status(200).end();;
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  /**
   * @api {get} /api/v1/coins/list List coins
   * @apiName list-coins
   * @apiParam {Boolean} less  true if you want to just get the major coins info.
   * @apiSuccess (200) {} coins
   */
  app.get(BASE_URL + "/coins/list", async (req, res) => {
    let isLess = req.query.less
    if (isLess) {
      var output = COIN_LISTS;
      res.status(200).send(output);
      return;
    }
    var config = {
      method: 'get',
      url: 'https://api.coingecko.com/api/v3/coins/list',
      headers: { 
        'Cookie': '__cfduid=dd68977b238609c57b157bba9b2cc9c3a1607133993'
      }
    };

    axios(config)
    .then(function (response) {
      const output = response.data;
      res.status(200).send(output);
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  /**
   * @api {get} /api/v1/coins/:coinID Get Info of A Coin
   * @apiName get-info-of-a-coin
   * @apiParam {String} coinID  The ID of a coin, fetched from `list-coins` api.
   * @apiSuccess (200) {} coins
   */
  app.get(BASE_URL + "/coins/:coinID", async (req, res) => {
    const coinID = req.params.coinID;
    let config = getCoinPriceAxiosConfig(coinID);
    axios(config)
    .then(function (response) {
      const data = response.data;
      const output = {
        "id": data.id,
        "symbol": data.symbol,
        "name": data.name,
        "description": data.description.en,
        "current_price": data.market_data.current_price.usd
      }
      res.status(200).send(output);
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  /**
   * @api {get} /api/v1/coins/timesup/:coinID End A Coin Game
   * @apiName end-a-coin-game
   * @apiParam {String} coinID  The ID of a coin, fetched from `list-coins` api.
   * @apiParam {Number} estimatedPrice  The Betting Price
   * @apiParam {Boolean} teamOneIsHigher  if the team one is betting on higher, then its true, else its false.
   * @apiSuccess (200)
   */
  app.post(BASE_URL + "/coins/timesup/:coinID", async (req, res) => {
    const coinID = req.params.coinID;
    const estimatedPrice = req.query.estimatedPrice;
    const teamOneIsHigher = req.query.teamOneIsHigher;
    console.log("`coins/timesup/`", coinID, " ", estimatedPrice, " ", teamOneIsHigher);
    let config = getCoinPriceAxiosConfig(coinID);
    axios(config)
    .then(function (response) {
      const latestPrice = response.data.market_data.current_price.usd;

      let score1 = 0, score2 = 0;
      if (latestPrice > estimatedPrice) {
        if (teamOneIsHigher) {
          score1 = 1;
          score2 = 0;
        } else {
          score1 = 0;
          score2 = 1;
        }
      } else {
        if (teamOneIsHigher) {
          score1 = 0;
          score2 = 1;
        } else {
          score1 = 1;
          score2 = 0;
        }
      }

      confluxEndLottery(score1, score2).then(() => {
      })
      .catch(function (error){
        console.log("conflux End Lottery: ", error);
      });
      res.status(200).end();
    })
    .catch(function (error) {
      console.log("coins timesup: ", error);
    });
  })

  app.listen(port, () => console.log(`${port} is active`));

  process.on("SIGINT", () => {
    process.exit();
  });
};

main();
