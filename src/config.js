const network = "mainnet"

const networks = {
  custom: {
    apiBase: 'http://localhost:6869',
    chainId: 'R',
    dApp: '3MHvD3FRqQR3sar6xq9yzChQRtzpT3f2E2u',
    OTCu: 'Dxp39CXUpXHVKSiGZvypVKv5BVy9B4qD1YDoYorqjJBf',
    refreshInterval: 5000
  },
  testnet: {
    apiBase: 'https://testnodes.wavesnodes.com',
    matcherApiBase: 'https://matcher.testnet.wavesnodes.com',
    chainId: 'T',
    dApp: '3Mt1KRk2dzQxMUSJQ9zz5sFhJ2wcHedqGgu',
    OTCu: '',
    refreshInterval: 5000
  },
  mainnet: {
    apiBase: 'https://nodes.wavesnodes.com',
    matcherApiBase: 'https://matcher.wavesplatform.com',
    chainId: 'W',
    dApp: '3PPPpppPdJqaKjC6HBdrXadTeVYBipz6kAE',
    OTCu: 'GHh7EMnVnUBCYNJMktuLPVr3P2oCqBCb4c87fBCZ5CzY',
    refreshInterval: 5000
  }
}

export default networks[network];
