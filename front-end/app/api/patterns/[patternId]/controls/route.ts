const BACKEND_URL = "http://localhost:5000";

export async function GET(
  request: Request,
  { params }: { params: { patternId: string } }
) {
  try {
    const patternId = params.patternId;
    const response = await fetch(`${BACKEND_URL}/patterns/${patternId}/controls`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    console.error("Error fetching pattern controls:", error);
    return Response.json(
      {
        message: "Error fetching pattern controls from backend",
      },
      { status: 500 }
    );
  }
}
