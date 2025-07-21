require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox-viem');
require('@nomicfoundation/hardhat-verify');

const DEPLOYER_KEY = process.env.DEPLOYER_KEY || '';
const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY || '';
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';

console.log('🔧 Config loaded:');
console.log('   - Infura Key:', INFURA_KEY ? `${INFURA_KEY.slice(0, 8)}...` : 'NOT SET');
console.log('   - Deployer Key:', DEPLOYER_KEY ? 'SET' : 'NOT SET');
console.log('   - Etherscan Key:', ETHERSCAN_API_KEY ? 'SET' : 'NOT SET');

module.exports = {
  solidity: '0.8.24',
  defaultNetwork: 'hardhat',
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 1,
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 137,
    },
  },
};