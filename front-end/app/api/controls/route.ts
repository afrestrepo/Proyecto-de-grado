const BACKEND_URL = "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/controls`, {
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
    console.error("Error fetching controls:", error);
    return Response.json(
      {
        message: "Error fetching controls from backend",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sanitizedBody = {
      name: body.name,
      description: body.description,
      patternId: body.patternId,
    };

    // Forward al backend real
    const response = await fetch(`${BACKEND_URL}/controls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating control:", error);
    return Response.json(
      {
        message: "Error creating control",
      },
      { status: 500 }
    );
  }
}
