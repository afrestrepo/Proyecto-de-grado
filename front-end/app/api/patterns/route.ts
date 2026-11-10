const BACKEND_URL = "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/patterns`, {
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
    console.error("Error fetching patterns:", error);
    return Response.json(
      {
        message: "Error fetching patterns from backend",
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
      keyControlAreas: body.keyControlAreas,
      whenToUse: body.whenToUse,
      whenNotToUse: body.whenNotToUse,
      typicalChallenges: body.typicalChallenges,
      threatResistance: body.threatResistance,
      assumptions: body.assumptions,
      developmentAreas: body.developmentAreas,
    };

    // Forward al backend real
    const response = await fetch(`${BACKEND_URL}/patterns`, {
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
    console.error("Error creating pattern:", error);
    return Response.json(
      {
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
