import { EvaluationProvider } from "@/context/evaluation-context";

export function EvaluationWrapper({
  evaluationId,
  children,
}: {
  evaluationId: string;
  children: React.ReactNode;
}) {
  return (
    <EvaluationProvider evaluationId={evaluationId}>
      {children}
    </EvaluationProvider>
  );
}
