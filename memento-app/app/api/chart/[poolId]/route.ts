import { NextResponse } from "next/server";

const YIELDS_API_BASE = "https://yields.llama.fi";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    
    const response = await fetch(`${YIELDS_API_BASE}/chart/${poolId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: `DefiLlama API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Chart proxy error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}

