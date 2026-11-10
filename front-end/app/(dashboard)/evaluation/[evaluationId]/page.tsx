import { redirect } from "next/navigation";

export default async function EvaluationRedirectPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;
  redirect(`/evaluation/${evaluationId}/identification`);
}
