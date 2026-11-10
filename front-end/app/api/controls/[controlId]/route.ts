const BACKEND_URL = "http://localhost:5000";

export async function DELETE(
  request: Request,
  { params }: { params: { controlId: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/controls/${params.controlId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error deleting control:", error);
    return Response.json(
      {
        message: "Error deleting control from backend",
      },
      { status: 500 }
    );
  }
}