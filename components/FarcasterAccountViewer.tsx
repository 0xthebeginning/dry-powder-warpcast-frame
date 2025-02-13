"use client"

import { useState, useEffect } from "react"
import { client, FARCASTER_ACCOUNTS_QUERY, PORTFOLIO_QUERY } from "../utils/graphql-client"

export default function FarcasterAccountViewer({ fid }: { fid: number }) {
  const [accountData, setAccountData] = useState<any>(null)
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFarcasterAccount = async () => {
      try {
        setLoading(true)
        const farcasterData = await client.request(FARCASTER_ACCOUNTS_QUERY, { fids: [fid] })
        setAccountData(farcasterData.accounts[0])

        if (farcasterData.accounts[0]) {
          const addresses = [
            farcasterData.accounts[0].farcasterProfile.custodyAddress,
            ...farcasterData.accounts[0].farcasterProfile.connectedAddresses,
          ]

          const portfolioData = await client.request(PORTFOLIO_QUERY, { addresses })
          const totalBalanceUSD = portfolioData.portfolio.tokenBalances.reduce(
            (sum: number, token: any) => sum + token.token.balanceUSD,
            0,
          )
          setTotalBalance(totalBalanceUSD)
        }
      } catch (err) {
        setError("Failed to fetch Farcaster account data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFarcasterAccount()
  }, [fid])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!accountData) return <div>No account found for this FID</div>

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Farcaster Account Information</h2>
      <p className="mb-2">
        <strong>Username:</strong> {accountData.farcasterProfile.username}
      </p>
      <p className="mb-2">
        <strong>FID:</strong> {accountData.farcasterProfile.fid}
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">
        Total Dry Powder you can shoot at warpcast ecosystem projects!
      </h3>
      <p className="text-2xl font-bold">Connected EVM Wallet(s) Total: ${totalBalance.toFixed(2)}</p>
    </div>
  )
}

