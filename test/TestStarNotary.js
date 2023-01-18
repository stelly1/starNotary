// error: "SyntaxError: Cannot use import statement outside a module"
//import { assert } from "console";

const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

//test 1
it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Star Test 1", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Star Test 1");
});

//test 2
it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("Star Test 2", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

//test 3
it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Star Test 3", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

//test 4
it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Star Test 4", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  //let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

//test 5
it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Star Test 5", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
//test 6
it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();

  let starId = 6;
  let user1 = accounts[1];

  await instance.createStar("Star Test 6", starId, { from: user1 });

  //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let tokenName = await instance.name.call();
  let tokenSymbol = await instance.symbol.call();

  assert.equal(tokenName, "Twinkle Twinkle");
  assert.equal(tokenSymbol, "LTSTR");
});

//test 7
it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  let instance = await StarNotary.deployed();

  let firstStarId = 7;
  let user1 = accounts[1];

  let secondStarId = 8;
  let user2 = accounts[2];

  await instance.createStar("Star Test 7.1", firstStarId, { from: user1 });
  await instance.createStar("Star Test 7.2", secondStarId, { from: user2 });

  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(firstStarId, secondStarId, { from: user1 });

  // 3. Verify that the owners changed
  assert.equal(await instance.ownerOf(firstStarId), user2);
  assert.equal(await instance.ownerOf(secondStarId), user1);
});

//test 8
it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();

  let user1 = accounts[1];
  let user2 = accounts[2];
  let thirdStarId = 9;

  await instance.createStar("Star Test 8", thirdStarId, { from: user1 });

  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(user2, thirdStarId, { from: user1 });

  // 3. Verify the star owner changed.
  assert.equal(await instance.ownerOf(thirdStarId), user2);
});

//test 9
it("lookUpTokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();

  let user1 = accounts[1];
  let fourthStarId = 10;

  await instance.createStar("Star Test 9", fourthStarId, { from: user1 });

  // 2. Call your method lookUptokenIdToStarInfo
  let StarName = await instance.lookUpTokenIdToStarInfo(fourthStarId);

  // 3. Verify if you Star name is the same
  assert.equal("Star Test 9", StarName);
});
