
'use server';
/**
 * @fileOverview A project assistant AI flow for clients.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  collectionGroup,
  Timestamp,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Helper function to get Firestore instance
function getDb() {
  const { firestore } = initializeFirebase();
  return firestore;
}

// TOOL: Get project IDs for a given user ID
const getProjectsForUser = ai.defineTool(
  {
    name: 'getProjectsForUser',
    description: "Get a list of project IDs and names for a given user ID. This is the first step to answer any user query.",
    inputSchema: z.object({ userId: z.string().describe("The user's Firebase UID.") }),
    outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
  },
  async ({ userId }) => {
    const db = getDb();
    const projects: { id: string; name: string }[] = [];
    const projectsQuery = query(collection(db, 'projects'), where('userId', '==', userId));
    const snapshot = await getDocs(projectsQuery);
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, name: doc.data().projectName });
    });
    return projects;
  }
);


// TOOL: Get payment transactions for a given project ID
const getProjectTransactions = ai.defineTool(
  {
    name: 'getProjectTransactions',
    description: 'Get financial transactions (payments and expenses) for a specific project.',
    inputSchema: z.object({ projectId: z.string().describe('The ID of the project.') }),
    outputSchema: z.array(z.object({
      type: z.string(),
      category: z.string(),
      amount: z.number(),
      date: z.string(),
      description: z.string(),
    })),
  },
  async ({ projectId }) => {
    const db = getDb();
    const transactions: any[] = [];
    const transQuery = query(collection(db, `projects/${projectId}/transactions`));
    const snapshot = await getDocs(transQuery);
    snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure date is valid before converting
      const dateString = data.date && data.date.seconds 
        ? new Date(data.date.seconds * 1000).toLocaleDateString()
        : 'N/A';
      transactions.push({
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: dateString,
        description: data.description,
      });
    });
    return transactions;
  }
);


// TOOL: Get labor information for a given project ID
const getProjectLaborers = ai.defineTool(
  {
    name: 'getProjectLaborers',
    description: 'Get aggregated information about laborer attendance and payments for a specific project. Use this to answer questions about total labor costs, payments, and workdays.',
    inputSchema: z.object({ projectId: z.string().describe('The ID of the project.') }),
    outputSchema: z.object({
        totalWorkDays: z.number(),
        totalLaborers: z.number(),
        totalBill: z.number(),
        totalPaid: z.number(),
        balanceDue: z.number(),
    }),
  },
  async ({ projectId }) => {
    const db = getDb();
    let totalWorkDays = 0;
    let totalLaborers = 0;
    let totalBill = 0;

    // 1. Calculate total bill from daily attendance
    const attendanceQuery = query(collection(db, `projects/${projectId}/dailyAttendances`));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    
    totalWorkDays = attendanceSnapshot.size;
    attendanceSnapshot.forEach(doc => {
        const att = doc.data();
        totalLaborers += att.numberOfLaborers || 0;
        totalBill += (att.numberOfLaborers || 0) * (att.wagePerLaborer || 0);
    });

    // 2. Calculate total paid from labor expenses
    const paymentsQuery = query(
        collection(db, `projects/${projectId}/transactions`),
        where('category', '==', 'Labor'),
        where('type', '==', 'Expense')
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const totalPaid = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

    // 3. Calculate balance
    const balanceDue = totalBill - totalPaid;

    return {
        totalWorkDays,
        totalLaborers,
        totalBill,
        totalPaid,
        balanceDue
    };
  }
);


export const ProjectChatInputSchema = z.object({
  userId: z.string().describe('The Firebase UID of the current user.'),
  query: z.string().describe("The user's question about their project."),
});
export type ProjectChatInput = z.infer<typeof ProjectChatInputSchema>;

export const ProjectChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and concise answer to the user\'s question, formatted in Markdown.'),
});
export type ProjectChatOutput = z.infer<typeof ProjectChatOutputSchema>;

const chatPrompt = ai.definePrompt({
    name: 'projectChatPrompt',
    system: `You are a friendly and helpful construction project assistant for a company named "ROY Construction & Consultant". Your goal is to answer the client's questions about their project(s).
    - You are an expert in analyzing the provided data from the tools. Do not hallucinate or make up information.
    - First, use the 'getProjectsForUser' tool to find the user's project(s). Most users will only have one project. If they have more than one and their question isn't specific, ask them which project they are referring to by name.
    - Once you know the project, use the available tools ('getProjectTransactions', 'getProjectLaborers') to find the information needed to answer the user's question.
    - You must only use the tools provided to answer questions.
    - Answer concisely and clearly. Use Markdown for formatting, such as lists, bold text, and tables, to make the information easy to read.
    - Always be polite and professional.
    - If you can't find the information or a question is outside your scope (e.g., asking for legal advice), politely state that you cannot answer and suggest they contact the project manager.
    - When presenting financial data, format it clearly (e.g., "Total Paid: ৳50,000").
    - DO NOT share the user's UID in your response.`,
    tools: [getProjectsForUser, getProjectTransactions, getProjectLaborers],
    input: { schema: z.object({ query: z.string(), userId: z.string() }) },
    output: { schema: ProjectChatOutputSchema },
  });
  

const projectChatFlow = ai.defineFlow(
  {
    name: 'projectChatFlow',
    inputSchema: ProjectChatInputSchema,
    outputSchema: ProjectChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await chatPrompt(input);
    return llmResponse.output!;
  }
);

export async function getProjectChatResponse(
  input: ProjectChatInput
): Promise<ProjectChatOutput> {
  return projectChatFlow(input);
}
