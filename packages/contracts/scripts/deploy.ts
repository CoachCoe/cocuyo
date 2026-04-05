import { ethers, upgrades, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

interface DeploymentInfo {
  network: string;
  chainId: number;
  deployer: string;
  timestamp: string;
  contracts: {
    BountyEscrow: {
      proxy: string;
      implementation: string;
    };
    FireflyReputation: {
      proxy: string;
      implementation: string;
    };
  };
}

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  if (!deployer) {
    throw new Error('No deployer account available');
  }
  const networkName = network.name;
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log('Deploying contracts with account:', deployer.address);
  console.log('Network:', networkName);
  console.log('Chain ID:', chainId);
  console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log('');

  // Deploy BountyEscrow
  console.log('Deploying BountyEscrow...');
  const BountyEscrow = await ethers.getContractFactory('BountyEscrow');
  const escrow = await upgrades.deployProxy(BountyEscrow, [deployer.address], {
    initializer: 'initialize',
  });
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  const escrowImplAddress = await upgrades.erc1967.getImplementationAddress(escrowAddress);

  console.log('BountyEscrow proxy deployed to:', escrowAddress);
  console.log('BountyEscrow implementation:', escrowImplAddress);
  console.log('');

  // Deploy FireflyReputation
  console.log('Deploying FireflyReputation...');
  const FireflyReputation = await ethers.getContractFactory('FireflyReputation');
  const reputation = await upgrades.deployProxy(FireflyReputation, [deployer.address], {
    initializer: 'initialize',
  });
  await reputation.waitForDeployment();

  const reputationAddress = await reputation.getAddress();
  const reputationImplAddress = await upgrades.erc1967.getImplementationAddress(reputationAddress);

  console.log('FireflyReputation proxy deployed to:', reputationAddress);
  console.log('FireflyReputation implementation:', reputationImplAddress);
  console.log('');

  // Save deployment info
  const deploymentInfo: DeploymentInfo = {
    network: networkName,
    chainId: Number(chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BountyEscrow: {
        proxy: escrowAddress,
        implementation: escrowImplAddress,
      },
      FireflyReputation: {
        proxy: reputationAddress,
        implementation: reputationImplAddress,
      },
    },
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('Deployment info saved to:', deploymentPath);

  console.log('');
  console.log('='.repeat(50));
  console.log('Deployment complete!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Contract Addresses:');
  console.log('  BountyEscrow:       ', escrowAddress);
  console.log('  FireflyReputation:  ', reputationAddress);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify contracts on block explorer');
  console.log('  2. Add updaters to FireflyReputation contract');
  console.log('  3. Update frontend config with contract addresses');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
