import PdfEstimationTool from '@/components/pdf-estimation-tool';

export default function PdfEstimationPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          AI Cost Estimation
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Upload a PDF or Image of your structural drawing. The AI will analyze the dimensions and provide an estimated construction cost.
        </p>
      </div>
      <PdfEstimationTool />
    </div>
  );
}
