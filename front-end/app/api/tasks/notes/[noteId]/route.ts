const BACKEND_URL = "http://localhost:5000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/tasks/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: body.texto }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    console.error("Error updating note:", error);
    return Response.json({ message: "Error updating note" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;

    const response = await fetch(`${BACKEND_URL}/tasks/notes/${noteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return Response.json({ message: "Error deleting note" }, { status: 500 });
  }
}
