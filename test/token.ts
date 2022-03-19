import { ethers } from "hardhat";
import { ContractTransaction } from "ethers";
import { expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Token__factory, Token } from "../typechain";

describe("Donation contract", () => {
  const name = "TonyToken";
  const symbol = "TT";
  const decimals = 18;
  const tokenInitialCount = 10000;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  let Token: Token__factory;
  let token: Token;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const transferTokens = async (
    senderAddr: SignerWithAddress = owner,
    receiverAddr: SignerWithAddress = addr1,
    receivedValue: number = 10
  ): Promise<[ContractTransaction, number]> => {
    const tx = await token.connect(senderAddr).transfer(receiverAddr.address, receivedValue);
    await tx.wait();

    return [tx, receivedValue];
  };

  beforeEach(async () => {
    Token = (await ethers.getContractFactory("Token")) as Token__factory;
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    token = await Token.deploy(tokenInitialCount);
    await token.deployed();
  });

  describe("Deployment", () => {
    it("Should return token name", async () => {
      const tokenName = await token.name();
      expect(tokenName).to.equal(name);
    });

    it("Should return token symbol", async () => {
      const tokenSymbol = await token.symbol();
      expect(tokenSymbol).to.equal(symbol);
    });

    it("Should return token decimals", async () => {
      const tokenDecimals = await token.decimals();
      expect(tokenDecimals).to.equal(decimals);
    });

    it("Should set the right tokenInitialCount", async () => {
      const totalTokensCount = await token.totalSupply();
      expect(totalTokensCount).to.equal(tokenInitialCount);
    });

    it("Should return initial token value for owner address after deploying", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(tokenInitialCount);
    });

    it("Should return 0 token value for any another address after deploying", async () => {
      const addressBalance = await token.balanceOf(addr1.address);
      expect(addressBalance).to.equal(0);
    });
  });

  describe("transfer", () => {
    it("Should revert function if balance is less than needle", async () => {
      const sentValue = 10;
      await expect(transferTokens(addr1, addr2, sentValue)).to.be.revertedWith("Your balance is less than needle");

      const addressBalance = await token.balanceOf(addr1.address);
      expect(addressBalance).to.equal(0);
    });

    it("Should transfer tokens to receiver address", async () => {
      const [transferTokensTx, sentValue] = await transferTokens();

      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(tokenInitialCount - sentValue);

      const addressBalance = await token.balanceOf(addr1.address);
      expect(addressBalance).to.equal(sentValue);

      await expect(transferTokensTx).to.emit(token, "Transfer").withArgs(owner.address, addr1.address, sentValue);
    });
  });

  describe("approve", () => {
    it("Should approve third side for sending tokens", async () => {
      const approvedValue = 100;
      const approveTx = await token.approve(addr2.address, approvedValue);
      await approveTx.wait();
      await expect(approveTx).to.emit(token, "Approval").withArgs(owner.address, addr2.address, approvedValue);

      const allowanceValue = await token.allowance(owner.address, addr2.address);
      await expect(allowanceValue).to.equal(approvedValue);
    });
  });

  describe("transferFrom", () => {
    it("Should revert function if balance is less than needle", async () => {
      const sentValue = 10;
      await expect(token.transferFrom(addr1.address, addr2.address, sentValue)).to.be.revertedWith(
        "Your balance is less than needle"
      );

      const addressBalance = await token.balanceOf(addr2.address);
      expect(addressBalance).to.equal(0);
    });

    it("Should revert function if third side has not enough permissions", async () => {
      // send tokens to another address from owner
      const [, sentValue] = await transferTokens();

      const addressBalance = await token.balanceOf(addr1.address);
      expect(addressBalance).to.equal(sentValue);

      // connect to third side (addr2) and try to send tokens without permissions
      const sentValueByThirdSide = 5;
      await expect(
        token.connect(addr2).transferFrom(addr1.address, addrs[0].address, sentValueByThirdSide)
      ).to.be.revertedWith("You cant transfer because you have not enough permissions");
    });

    it("Should transfer tokens if third side has permissions", async () => {
      // send tokens to another address from owner
      const [, sentValue] = await transferTokens(undefined, undefined, 200);

      // approve permissions for third side and check its balance
      const approvedValue = 100;
      await token.connect(addr1).approve(addr2.address, approvedValue);

      const allowanceValue = await token.allowance(addr1.address, addr2.address);
      await expect(allowanceValue).to.equal(approvedValue);

      // transfer tokens by third side and check balances
      const sentValueByThirdSide = 50;
      const transferFromTx = await token
        .connect(addr2)
        .transferFrom(addr1.address, addrs[0].address, sentValueByThirdSide);
      await transferFromTx.wait();

      const senderBalance = await token.balanceOf(addr1.address);
      expect(senderBalance).to.equal(sentValue - sentValueByThirdSide);

      const receiverBalance = await token.balanceOf(addrs[0].address);
      expect(receiverBalance).to.equal(sentValueByThirdSide);

      const thirdSideBalance = await token.allowance(addr1.address, addr2.address);
      expect(thirdSideBalance).to.equal(approvedValue - sentValueByThirdSide);

      await expect(transferFromTx)
        .to.emit(token, "Transfer")
        .withArgs(addr1.address, addrs[0].address, sentValueByThirdSide);
    });
  });

  describe("mint", () => {
    it("Should reverted function if address not an owner", async () => {
      const additionalTokens = 5000;
      await expect(token.connect(addr1).mint(owner.address, additionalTokens)).to.be.reverted;
    });

    it("Should mint additional tokens", async () => {
      const additionalTokens = 5000;
      const mintTx = await token.mint(owner.address, additionalTokens);
      await mintTx.wait();

      const totalTokensCount = await token.totalSupply();
      expect(totalTokensCount).to.equal(tokenInitialCount + additionalTokens);

      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(tokenInitialCount + additionalTokens);

      await expect(mintTx).to.emit(token, "Transfer").withArgs(zeroAddress, owner.address, additionalTokens);
    });
  });

  describe("burn", () => {
    it("Should reverted function if address not an owner", async () => {
      const burningTokens = 20000;
      await expect(token.connect(addr1).burn(owner.address, burningTokens)).to.be.reverted;
    });

    it("Should reverted function if burning tokens more than current balance", async () => {
      const burningTokens = 20000;
      await expect(token.burn(owner.address, burningTokens)).to.be.revertedWith(
        "Tokens balance is less than burning tokens value"
      );
    });

    it("Should birn definitely tokens amount", async () => {
      const burningTokens = 5000;
      const burnTx = await token.burn(owner.address, burningTokens);
      await burnTx.wait();

      const totalTokensCount = await token.totalSupply();
      expect(totalTokensCount).to.equal(tokenInitialCount - burningTokens);

      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(tokenInitialCount - burningTokens);

      await expect(burnTx).to.emit(token, "Transfer").withArgs(owner.address, zeroAddress, burningTokens);
    });
  });
});
