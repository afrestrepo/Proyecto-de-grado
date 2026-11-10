const BACKEND_URL = "http://localhost:5000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    console.error("Error fetching task:", error);
    return Response.json({ message: "Error fetching task" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();

    const sanitized: Record<string, unknown> = {};
    if (body.tratamiento !== undefined) sanitized.tratamiento = body.tratamiento;
    if (body.estado !== undefined) sanitized.estado = body.estado;
    if (body.responsableId !== undefined) sanitized.responsableId = body.responsableId;

    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    console.error("Error updating task:", error);
    return Response.json({ message: "Error updating task" }, { status: 500 });
  }
}
