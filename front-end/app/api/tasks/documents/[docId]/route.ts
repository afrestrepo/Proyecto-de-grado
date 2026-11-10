const BACKEND_URL = "http://localhost:5000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/tasks/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreArchivo: body.nombreArchivo }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    console.error("Error updating document:", error);
    return Response.json({ message: "Error updating document" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;

    const response = await fetch(`${BACKEND_URL}/tasks/documents/${docId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return Response.json({ message: "Error deleting document" }, { status: 500 });
  }
}
