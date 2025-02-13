import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  console.log("OG route called with URL:", request.url)

  try {
    const { searchParams } = new URL(request.url)
    const balance = searchParams.get("balance")
    const initial = searchParams.get("initial") === "true"

    console.log("OG route params:", { balance, initial })

    if (initial) {
      console.log("Generating initial image")
      return new ImageResponse(
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#4F46E5",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
            }}
          >
            Check Your Dry Powder
          </div>
        </div>,
        {
          width: 1200,
          height: 630,
        },
      )
    } else if (balance) {
      console.log(`Generating balance image with balance: ${balance}`)
      return new ImageResponse(
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#4F46E5",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: 60,
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
            }}
          >
            <span>Total Dry Powder:</span>
            <span>${balance}</span>
          </div>
        </div>,
        {
          width: 1200,
          height: 630,
        },
      )
    } else {
      console.log("Invalid parameters provided")
      return new Response("Invalid parameters", { status: 400 })
    }
  } catch (error) {
    console.error("Error in OG route:", error)
    return new Response(`Error generating image: ${error.message}`, { status: 500 })
  }
}

