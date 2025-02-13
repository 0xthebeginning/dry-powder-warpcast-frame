import { type NextRequest, NextResponse } from "next/server"
import { client, FARCASTER_ACCOUNTS_QUERY, PORTFOLIO_QUERY } from "@/utils/graphql-client"

async function generateFrameHtml(fid?: number) {
  console.log(`Generating frame HTML for FID: ${fid}`)

  const baseImageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/og`

  if (!fid) {
    console.log("No FID provided, returning initial frame")
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Farcaster Dry Powder</title>
          <meta property="og:title" content="Check Your Dry Powder">
          <meta property="og:image" content="${baseImageUrl}?initial=true&t=${Date.now()}">
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${baseImageUrl}?initial=true&t=${Date.now()}">
          <meta property="fc:frame:button:1" content="Check My Dry Powder">
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frame">
        </head>
        <body>
          <h1>Check Your Dry Powder Balance</h1>
        </body>
      </html>
    `
  }

  try {
    console.log(`Fetching data for FID: ${fid}`)
    const farcasterData = await client.request(FARCASTER_ACCOUNTS_QUERY, { fids: [fid] })
    console.log("Farcaster data:", JSON.stringify(farcasterData, null, 2))

    const accountData = farcasterData.accounts[0]
    if (!accountData) {
      console.log(`No account found for FID: ${fid}`)
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Farcaster Dry Powder</title>
            <meta property="og:title" content="No Account Found">
            <meta property="og:image" content="${baseImageUrl}?balance=0.00&t=${Date.now()}">
            <meta property="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${baseImageUrl}?balance=0.00&t=${Date.now()}">
            <meta property="fc:frame:button:1" content="Try Again">
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frame">
          </head>
          <body>
            <h1>No account found for this FID</h1>
          </body>
        </html>
      `
    }

    const addresses = [accountData.farcasterProfile.custodyAddress, ...accountData.farcasterProfile.connectedAddresses]

    console.log("Fetching portfolio data for addresses:", addresses)
    const portfolioData = await client.request(PORTFOLIO_QUERY, { addresses })
    console.log("Portfolio data:", JSON.stringify(portfolioData, null, 2))

    const totalBalanceUSD = portfolioData.portfolio.tokenBalances.reduce(
      (sum: number, token: any) => sum + token.token.balanceUSD,
      0,
    )

    const formattedBalance = totalBalanceUSD.toFixed(2)
    console.log(`Generated total balance: $${formattedBalance}`)

    const imageUrl = `${baseImageUrl}?balance=${encodeURIComponent(formattedBalance)}&t=${Date.now()}`
    console.log("Generated image URL:", imageUrl)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Farcaster Dry Powder</title>
          <meta property="og:title" content="Your Dry Powder Balance">
          <meta property="og:image" content="${imageUrl}">
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${imageUrl}">
          <meta property="fc:frame:button:1" content="Refresh">
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frame">
        </head>
        <body>
          <h1>Total Dry Powder: $${formattedBalance}</h1>
        </body>
      </html>
    `
  } catch (error) {
    console.error("Error generating frame HTML:", error)
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Farcaster Dry Powder</title>
          <meta property="og:title" content="Error">
          <meta property="og:image" content="${baseImageUrl}?balance=0.00&error=true&t=${Date.now()}">
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${baseImageUrl}?balance=0.00&error=true&t=${Date.now()}">
          <meta property="fc:frame:button:1" content="Try Again">
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frame">
        </head>
        <body>
          <h1>Error fetching data. Please try again.</h1>
        </body>
      </html>
    `
  }
}

export async function GET(request: NextRequest) {
  console.log("GET request received")
  console.log("GET request URL:", request.url)
  console.log("GET request headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2))

  const frameHtml = await generateFrameHtml()
  return new NextResponse(frameHtml, {
    headers: { "Content-Type": "text/html" },
  })
}

export async function POST(req: NextRequest) {
  console.log("POST request received")
  try {
    const body = await req.json()
    console.log("Received POST body:", JSON.stringify(body, null, 2))

    let fid: number | undefined

    if (body.untrustedData && body.untrustedData.fid) {
      fid = Number(body.untrustedData.fid)
      console.log(`Extracted FID from untrustedData: ${fid}`)
    } else {
      console.log("FID not found in untrustedData")
    }

    const frameHtml = await generateFrameHtml(fid)
    return new NextResponse(frameHtml, {
      headers: { "Content-Type": "text/html" },
    })
  } catch (error) {
    console.error("Error processing POST request:", error)
    return new NextResponse("Error processing request", { status: 500 })
  }
}

