import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@parity/hardhat-polkadot';
import { HardhatUserConfig } from 'hardhat/config';
import 'dotenv/config';

// Extended config type for hardhat-polkadot plugin
interface ExtendedHardhatUserConfig extends HardhatUserConfig {
  polkadot?: {
    buildType?: string;
    outputDir?: string;
  };
}

const config: ExtendedHardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'cancun',
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: 31337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    paseo: {
      url: process.env.PASEO_RPC_URL || 'https://services.polkadothub-rpc.com/testnet',
      chainId: 420420417,
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : ['ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
      polkadot: {
        target: 'pvm',
      },
    },
  },
  polkadot: {
    buildType: 'revive',
    outputDir: './artifacts-revive',
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: './typechain-types',
    target: 'ethers-v6',
  },
};

export default config;
