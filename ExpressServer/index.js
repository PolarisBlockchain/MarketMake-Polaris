const express = require("express");
const bodyParser = require("body-parser");
const { Conflux } = require("js-conflux-sdk");
require("dotenv").config();

const app = express();
const port = 5001;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const X_RAPIDAPI_KEY = process.env.X_RAPIDAPI_KEY;
const X_RAPIDAPI_HOST = process.env.X_RAPIDAPI_HOST;
const NBA_BASE_URL = "https://api-nba-v1.p.rapidapi.com/";
const BASE_COIN_PRICE_URL = "https://api.coingecko.com/api/v3" // documentation is here: https://www.coingecko.com/api/documentations/v3
const axios = require('axios');

const COIN_LISTS = [
  { "id":"ethereum", "symbol":"eth", "name":"Ethereum" },
  { "id": "ethereum-classic", "symbol": "etc", "name": "Ethereum Classic" },
  { "id": "bitcoin", "symbol": "btc", "name": "Bitcoin" }
]

const NBA_URL_PATHS = {
  seasons: "seasons/",
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
    url: NBA_BASE_URL + subPath,
    headers: { 
      'x-rapidapi-key': X_RAPIDAPI_KEY,
      'x-rapidapi-host': X_RAPIDAPI_HOST
    }
  };

  return config;
}

const main = () => {
  app.use(bodyParser.json());

  app.get("/nba/season/list", async (req, res) => {
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

  // app.post("/nba", async(req, res) => {

  // })

  app.get("/coins/list", async (req, res) => {
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

  app.get("/coins/:coinID", async (req, res) => {
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

  app.post("/coins/timesup/:coinID", async (req, res) => {
    const coinID = req.params.coinID;
    let config = getCoinPriceAxiosConfig(coinID);
    axios(config)
    .then(function (response) {
      const data = response.data;
      const output = {
        "id": data.id,
        "symbol": data.symbol,
        "name": data.name,
        "current_price": data.market_data.current_price.usd
      }

      //create conflux instance
      const cfx = new Conflux({
        url: "http://test.confluxrpc.org",
        defaultGasPrice: 100,
        defaultGas: 1000000,
        // logger: console,
      });

      const account = cfx.Account(PRIVATE_KEY); // create account instance
      console.log("Address: ", account.address); // 0x1bd9e9be525ab967e633bcdaeac8bd5723ed4d6b

      // create contract instance
      const contract = cfx.Contract({
        abi: require("./contract/coin_abi.json"), //can be copied from remix
        address: "0x8ac6bf0700ed41d1323a1f9c16d85d76f1196cdb",
      });

      // const receipt = await contract()

      res.status(200);
    })
    .catch(function (error) {
      console.log(error);
    });

  })

  app.listen(port, () => console.log(`${port} is active`));

  process.on("SIGINT", () => {
    process.exit();
  });
};

main();
