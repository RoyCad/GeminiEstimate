'use server';
/**
 * @fileOverview Fetches and displays current market prices for construction materials using the Gemini API.
 *
 * - getMarketPrice - A function that fetches the market price of a given material.
 * - GetMarketPriceInput - The input type for the getMarketPrice function.
 * - GetMarketPriceOutput - The return type for the getMarketPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMarketPriceInputSchema = z.object({
  material: z.string().describe('The construction material to fetch the price for (e.g., cement, rod, brick, sand).'),
});
export type GetMarketPriceInput = z.infer<typeof GetMarketPriceInputSchema>;

const MaterialPriceInfoSchema = z.object({
  brand: z.string().describe('The brand name of the material.'),
  price: z.string().describe('The current market price of the material.'),
  unit: z.string().describe('The unit of measurement for the price (e.g., per bag, per ton).'),
});

const GetMarketPriceOutputSchema = z.object({
  prices: z.array(MaterialPriceInfoSchema).describe('A list of market prices for the requested material.'),
});
export type GetMarketPriceOutput = z.infer<typeof GetMarketPriceOutputSchema>;

export async function getMarketPrice(input: GetMarketPriceInput): Promise<GetMarketPriceOutput> {
  return getMarketPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMarketPricePrompt',
  input: {schema: GetMarketPriceInputSchema},
  output: {schema: GetMarketPriceOutputSchema},
  prompt: `You are an expert financial analyst specializing in the construction market of Bangladesh. Your task is to provide the current market prices for a specific construction material.

User wants to know the price of: {{{material}}}.

Based on the user's query, find the current market prices for several top brands of the requested material available in Bangladesh.
Your response must be a list of objects, where each object contains the 'brand', the 'price', and the 'unit' of measurement (e.g., per bag, per ton, per piece).
If you cannot find any prices for the specified material, you MUST return an empty list. Do not provide any fabricated or inaccurate information.`,
});

const getMarketPriceFlow = ai.defineFlow(
  {
    name: 'getMarketPriceFlow',
    inputSchema: GetMarketPriceInputSchema,
    outputSchema: GetMarketPriceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
