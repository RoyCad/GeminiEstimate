'use server';

/**
 * @fileOverview AI-powered cost estimation from structural drawings (PDF/Image).
 *
 * - pdfBasedEstimation - Analyzes a drawing and returns an estimated construction cost.
 * - PdfBasedEstimationInput - The input type for the pdfBasedEstimation function.
 * - PdfBasedEstimationOutput - The return type for the pdfBasedEstimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfBasedEstimationInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A structural drawing file (PDF, JPG, PNG), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PdfBasedEstimationInput = z.infer<typeof PdfBasedEstimationInputSchema>;

const PdfBasedEstimationOutputSchema = z.object({
  totalEstimatedCost: z
    .number()
    .describe('The total estimated cost to construct the building in BDT. This should be 0 if the input is not a structural plan.'),
  costPerFloor: z
    .string()
    .describe('The estimated cost per floor in BDT. This should be "N/A" if the input is not a structural plan.'),
  analysisSummary: z
    .string()
    .describe('A summary of the AI\'s analysis of the provided plan. Explain why an estimate cannot be provided if it is not a structural plan.'),
});
export type PdfBasedEstimationOutput = z.infer<typeof PdfBasedEstimationOutputSchema>;

export async function pdfBasedEstimation(
  input: PdfBasedEstimationInput
): Promise<PdfBasedEstimationOutput> {
  return pdfBasedEstimationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pdfBasedEstimationPrompt',
  input: {schema: PdfBasedEstimationInputSchema},
  output: {schema: PdfBasedEstimationOutputSchema},
  prompt: `You are an expert AI cost estimator for construction projects in Bangladesh. Your task is to analyze a file (PDF or Image) containing building information and provide cost estimates in Bangladeshi Taka (BDT).

**Analysis Steps:**

1.  **Examine the Input:** Analyze the provided document. Determine if it's a structural drawing/floor plan.

2.  **If it IS a Structural Plan (PDF/JPG/PNG):**
    -   Analyze the dimensions and details available in the plan.
    -   Calculate the estimates based on current market rates for materials (cement, steel, bricks, sand, etc.) and labor in Bangladesh.
    -   Provide the following estimates:
        -   \`totalEstimatedCost\`: The total estimated cost for the entire building.
        -   \`costPerFloor\`: The estimated cost per floor.
        -   \`analysisSummary\`: A brief summary of your analysis, mentioning key aspects of the plan you considered.

3.  **If it is NOT a Structural Plan (e.g., a photo of a completed house, a random image):**
    -   You MUST state that an accurate cost cannot be provided from a simple photo.
    -   Set \`totalEstimatedCost\` to 0.
    -   Set \`costPerFloor\` to "N/A".
    -   In the \`analysisSummary\`, explain that a proper floor plan is required for an accurate calculation. You can provide a very general, non-binding cost range for a similar-looking building as a helpful tip, but make it clear this is not a real estimate. For example: "It is not possible to provide an accurate estimate from this image as it is not a structural drawing. A proper floor plan is needed for a detailed calculation. However, for a building of this appearance, the cost could roughly range from X to Y BDT."

**Important Rules:**
-   Ensure the output strictly conforms to the provided JSON schema.
-   ALWAYS conclude your \`analysisSummary\` with the following disclaimer, exactly as written: "This is for informational purposes only. For professional consulting, contact us at 01977525823 (Phone or WhatsApp)."

Document File: {{media url=fileDataUri}}
  `,
});

const pdfBasedEstimationFlow = ai.defineFlow(
  {
    name: 'pdfBasedEstimationFlow',
    inputSchema: PdfBasedEstimationInputSchema,
    outputSchema: PdfBasedEstimationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
