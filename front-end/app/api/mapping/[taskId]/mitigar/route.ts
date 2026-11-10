const BACKEND_URL = "http://localhost:5000";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const response = await fetch(`${BACKEND_URL}/mapping/${taskId}/mitigar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return Response.json({ data });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error calling mapping:", error);
    return Response.json({ message: "Error calling mapping" }, { status: 500 });
  }
}
