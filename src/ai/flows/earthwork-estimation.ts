'use server';
/**
 * @fileOverview A flow for estimating time and manpower for earthwork.
 *
 * - estimateEarthwork - A function that provides an estimation.
 * - EarthworkInput - The input type for the estimateEarthwork function.
 * - EarthworkOutput - The return type for the estimateEarthwork function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const EarthworkInputSchema = z.object({
  volume: z
    .number()
    .describe('The total volume of earth to be excavated in cubic feet (cft).'),
});
export type EarthworkInput = z.infer<typeof EarthworkInputSchema>;

const EarthworkOutputSchema = z.object({
  time: z.string().describe("A realistic estimation of the time required to complete the work, like '5-7 days' or '2 weeks'."),
  manpower: z.string().describe("An estimation of the number of laborers required, like '10-12 laborers'."),
});
export type EarthworkOutput = z.infer<typeof EarthworkOutputSchema>;

export async function estimateEarthwork(
  input: EarthworkInput
): Promise<EarthworkOutput> {
  return estimateEarthworkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateEarthworkPrompt',
  input: {schema: EarthworkInputSchema},
  output: {schema: EarthworkOutputSchema},
  prompt: `You are a construction project manager in Bangladesh. Based on the following volume of earthwork, provide a realistic estimate for the time and manual labor required. Assume standard manual excavation methods without heavy machinery.

Earthwork Volume: {{{volume}}} cft.

Provide a practical time estimate (e.g., in days or weeks) and the number of laborers needed. The estimates should be a range.`,
});

const estimateEarthworkFlow = ai.defineFlow(
  {
    name: 'estimateEarthworkFlow',
    inputSchema: EarthworkInputSchema,
    outputSchema: EarthworkOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
