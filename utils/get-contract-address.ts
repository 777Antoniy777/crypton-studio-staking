import fs from "fs";

export const getContractAddress = (): { address: string } | void => {
  const addressFile = __dirname + "/../contracts/contract-address.json";

  if (!fs.existsSync(addressFile)) {
    console.error("You need to deploy your contract first");

    return;
  }

  const addressJson = fs.readFileSync(addressFile);
  return JSON.parse(`${addressJson}`);
};