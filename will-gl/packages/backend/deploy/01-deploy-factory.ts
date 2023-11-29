import { PRIVATE_KEY } from "../hardhat.config";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { utils, Wallet, Provider } from "zksync-web3";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for AA`);
  const provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(PRIVATE_KEY || "", provider);

  const deployer = new Deployer(hre, wallet);
  const factoryArtifact = await deployer.loadArtifact("AAFactory");

  const aaArtifact = await deployer.loadArtifact("Account");

  const factory = await deployer.deploy(
    factoryArtifact,
    [utils.hashBytecode(aaArtifact.bytecode)],
    undefined,
    [aaArtifact.bytecode]
  );
  console.log(`AA factory address: ${factory.address}`);
  const aaFactory = new ethers.Contract(
    factory.address,
    factoryArtifact.abi,
    wallet
  );
  /* const owner = await wallet.getSinger();
   */
  const salt = ethers.constants.HashZero;
  const tx = await aaFactory.deployAccount(salt, wallet.address);
  await tx.wait();

  const abiCoder = new ethers.utils.AbiCoder();
  const accountAddress = utils.create2Address(
    factory.address,
    await aaFactory.aaBytecodeHash(),
    salt,
    abiCoder.encode(["address"], [wallet.address])
  );

  console.log(`Account deployed on address ${accountAddress}`);

  await (
    await wallet.sendTransaction({
      to: accountAddress,
      value: ethers.utils.parseEther("0.01"),
    })
  ).wait();
  const accountContract = new ethers.Contract(
    accountAddress,
    aaArtifact.abi,
    wallet
  );
  console.log(await accountContract.owner());
}
