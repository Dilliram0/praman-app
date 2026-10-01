import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/db';

export const runtime = 'nodejs';
export async function GET(_: Request, context: {params: Promise<{id:string}>}) {
  const {id}=await context.params; const product=getProduct(id);
  return product ? NextResponse.json(product) : NextResponse.json({error:'Product not found'}, {status:404});
}
