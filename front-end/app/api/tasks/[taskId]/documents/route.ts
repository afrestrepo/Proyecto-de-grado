const BACKEND_URL = "http://localhost:5000";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}/documents`, {
      method: "POST",
      body: formData,
      // No Content-Type — fetch lo establece automáticamente con el boundary correcto
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return Response.json({ message: "Error uploading document" }, { status: 500 });
  }
}
