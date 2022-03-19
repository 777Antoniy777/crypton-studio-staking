import { Contract } from "ethers";
import { task } from "hardhat/config";

import { TaskArguments } from "hardhat/types";
import { getContractAddress } from "../utils/get-contract-address";

task("transferFrom", "Transfer value from sender to receiver by third side")
  .addParam("sender", "Sender address")
  .addParam("receiver", "Receiver address")
  .addParam("value", "Value of tokens")
  .setAction(async (taskArgs: TaskArguments, { ethers }) => {
    const { sender, receiver, value } = taskArgs;
    const parsedAddress = getContractAddress();

    if (parsedAddress) {
      const Token: Contract = await ethers.getContractAt("Token", parsedAddress.address);
      const decimals = await Token.decimals();
      const transformedValue = ethers.BigNumber.from(10).pow(decimals).mul(value);

      await Token.transferFrom(sender, receiver, transformedValue);
    }
  });
