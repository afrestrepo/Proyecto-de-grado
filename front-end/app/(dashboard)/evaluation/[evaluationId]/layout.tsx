import StepperNav from "@/components/layout/stepper-nav";
import { EvaluationWrapper } from "./evaluation-wrapper";

export default async function EvaluacionStepperLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;

  return (
    <EvaluationWrapper evaluationId={evaluationId}>
      <div className="flex flex-col gap-6">
        <StepperNav />
        <div>{children}</div>
      </div>
    </EvaluationWrapper>
  );
}
