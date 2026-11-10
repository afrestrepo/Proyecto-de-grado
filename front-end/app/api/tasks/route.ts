const BACKEND_URL = "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/tasks`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return Response.json(
      { message: "Error fetching tasks from backend" },
      { status: 500 }
    );
  }
}
