import { Contract } from "ethers";
import fs from "fs";

export const saveContractAddress = (contract: Contract): void => {
  const contractsDir = __dirname + "/../contracts";

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ address: contract.address }, undefined, 2)
  );
};
