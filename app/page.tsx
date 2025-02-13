"use client"

import { useState } from "react"
import FarcasterAccountViewer from "@/components/FarcasterAccountViewer"

export default function Home() {
  const [fid, setFid] = useState<number>(1)

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Farcaster Dry Powder Viewer</h1>
      <div className="mb-6">
        <input type="number" value={fid} onChange={(e) => setFid(Number(e.target.value))} className="border p-2 mr-2" />
        <button onClick={() => setFid(fid)} className="bg-blue-500 text-white px-4 py-2 rounded">
          Set FID
        </button>
      </div>
      <FarcasterAccountViewer fid={fid} />
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Warpcast Frame</h2>
        <p>To use this as a Warpcast frame, use the following URL:</p>
        <code className="bg-gray-100 p-2 rounded block mt-2">{process.env.NEXT_PUBLIC_HOST}/api/frame</code>
      </div>
    </main>
  )
}

