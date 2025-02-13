import { GraphQLClient } from "graphql-request"

const API_URL = "https://public.zapper.xyz/graphql"
const API_KEY = process.env.ZAPPER_API_KEY

if (!API_KEY) {
  throw new Error("ZAPPER_API_KEY is not set in environment variables")
}

const encodedKey = Buffer.from(API_KEY).toString("base64")

export const client = new GraphQLClient(API_URL, {
  headers: {
    Authorization: `Basic ${encodedKey}`,
  },
})

export const FARCASTER_ACCOUNTS_QUERY = `
query GetFarcasterAddresses($fids: [Float!]) {
  accounts(fids: $fids) {
    farcasterProfile {
      username
      fid
      connectedAddresses
      custodyAddress
    }
  }
}
`

export const PORTFOLIO_QUERY = `
query PortfolioQuery($addresses: [Address!]!) {
  portfolio(addresses: $addresses) {
    tokenBalances {
      address
      network
      token {
        balance
        balanceUSD
        baseToken {
          name
          symbol
        }
      }
    }
  }
}
`

