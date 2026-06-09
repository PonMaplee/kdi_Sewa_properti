const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Konfigurasi kontrak
  const rentAmount = ethers.parseEther("0.05");      // 0.05 ETH per bulan
  const leaseDurationDays = 30;                        // 30 hari per pembayaran
  const penaltyRate = 10;                              // 10% denda
  const gracePeriodHours = 24;                         // 24 jam masa tenggang

  const DigitalLease = await ethers.getContractFactory("DigitalLease");
  const digitalLease = await DigitalLease.deploy(
    rentAmount,
    leaseDurationDays,
    penaltyRate,
    gracePeriodHours
  );

  await digitalLease.waitForDeployment();
  const contractAddress = await digitalLease.getAddress();

  console.log("\n========================================");
  console.log("  Digital Lease Contract Deployed!");
  console.log("========================================");
  console.log("  Address:", contractAddress);
  console.log("  Rent Amount:", ethers.formatEther(rentAmount), "ETH");
  console.log("  Lease Duration:", leaseDurationDays, "days");
  console.log("  Penalty Rate:", penaltyRate, "%");
  console.log("  Grace Period:", gracePeriodHours, "hours");
  console.log("========================================\n");

  // Simpan address untuk frontend & backend
  const fs = require("fs");
  const deploymentData = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    timestamp: new Date().toISOString(),
    config: {
      rentAmount: ethers.formatEther(rentAmount),
      leaseDurationDays,
      penaltyRate,
      gracePeriodHours,
    },
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
