const CrowdsaleDAOFactory = artifacts.require("./DAO/CrowdsaleDAOFactory.sol");
const Users = artifacts.require("./Users/Users.sol");
const DAOx = artifacts.require("./DAOx.sol");
const Common = artifacts.require("./Common.sol");
const Voting = artifacts.require("./Votings/Voting.sol");
const VotingFactory = artifacts.require("./Votings/VotingFactory.sol");
const Token = artifacts.require("./Token/Token.sol");
const DAOProxy = artifacts.require("./DAO/DAOProxy.sol");
const DAOLib = artifacts.require("./DAO/DAOLib.sol");
const State = artifacts.require("./DAO/Modules/State.sol");
const Payment = artifacts.require("./DAO/Modules/Payment.sol");
const VotingDecisions = artifacts.require("./DAO/Modules/VotingDecisions.sol");
const Crowdsale = artifacts.require("./DAO/Modules/Crowdsale.sol");
CrowdsaleDAOFactory.link(DAOProxy);
CrowdsaleDAOFactory.link(DAOLib);
const DAOJson = require("../../build/contracts/CrowdsaleDAO");
const Web3 = require("web3");
const web3 = new Web3();

module.exports = {
    createCrowdsaleDAOFactory: async (accounts, data = null) => {
        const _DAOx = await DAOx.new();
        const _VotingFactory = await VotingFactory.new(Voting.address);

        return await CrowdsaleDAOFactory.new(
            _DAOx.address,
            _VotingFactory.address,
            [State.address, Payment.address, VotingDecisions.address, Crowdsale.address]
        );
    },

    createCrowdsaleDAO: (cdf, accounts, data = null) => {
        const [daoName, daoDescription, daoMinVote, DAOOwner, softCap, hardCap, rate, startBlock, endBlock] = data || ["Test", "Test DAO", 51, accounts[2], 100, 1000, 100, 100, 100000];

        return cdf.createCrowdsaleDAO(daoName, daoDescription)
            .then(tx => {
                const result = web3.eth.abi.decodeParameters(["address", "string"], tx.receipt.logs[0].data);
                cdf.dao = new web3.eth.Contract(DAOJson.abi, result[0]);

                return cdf;
            });
    }
};

const getLatestBlockTimestamp = web3 =>
    new Promise((resolve, reject) =>
        web3.eth.getBlock("latest", block => resolve(block)));

const rpcCall = (methodName, params, id) =>
    new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: methodName,
            params: params,
            id: id
        }, (err, result) => {
            if (err) return reject(err);

            resolve(result);
        });
    });

const fillZeros = (phrase) => {
    const totalLength = 66;
    const lengthDifference = totalLength - phrase.length;
    const zeroArray = new Array(lengthDifference).fill(0);

    return phrase.concat(zeroArray.join(""));
};

module.exports.getLatestBlockTimestamp = getLatestBlockTimestamp;
module.exports.rpcCall = rpcCall;
module.exports.fillZeros = fillZeros;