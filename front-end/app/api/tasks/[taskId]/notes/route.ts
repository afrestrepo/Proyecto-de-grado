const BACKEND_URL = "http://localhost:5000";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: body.texto }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return Response.json({ message: "Error creating note" }, { status: 500 });
  }
}
