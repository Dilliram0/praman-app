import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const userState = pgTable('user_state', {
  userId: text('user_id').primaryKey(),
  saved: jsonb('saved').$type<string[]>().notNull().default([]),
  shoppingList: jsonb('shopping_list').$type<string[]>().notNull().default([]),
  preferences: jsonb('preferences').$type<{ diet: string; allergens: string[] }>().notNull().default({ diet: 'No preference', allergens: [] }),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  barcode: text('barcode'),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
});
