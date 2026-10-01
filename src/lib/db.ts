import { desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { submissions, userState } from '../../db/schema';

export type PramanState = { saved:string[]; shoppingList:string[]; preferences:{diet:string; allergens:string[]}; submissions:{id:number;name:string;barcode:string|null;createdAt:string}[] };

export async function getState(userId = 'guest'): Promise<PramanState> {
  const [row] = await db.select().from(userState).where(eq(userState.userId, userId));
  const pending = await db.select().from(submissions).orderBy(desc(submissions.id));
  return {
    saved: row?.saved ?? [],
    shoppingList: row?.shoppingList ?? [],
    preferences: row?.preferences ?? { diet: 'No preference', allergens: [] },
    submissions: pending,
  };
}

export async function saveState(input: Pick<PramanState,'saved'|'shoppingList'|'preferences'>, userId = 'guest') {
  await db.insert(userState).values({ userId, ...input }).onConflictDoUpdate({
    target: userState.userId,
    set: input,
  });
  return getState(userId);
}

export async function addSubmission(name: string, barcode: string | null) {
  const [submission] = await db.insert(submissions).values({ name, barcode }).returning();
  return submission;
}
