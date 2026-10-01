import { NextRequest, NextResponse } from 'next/server';
import { getState, saveState } from '@/lib/db';
export const runtime = 'nodejs';
export function GET(request:NextRequest){return NextResponse.json(getState(request.cookies.get('praman_user')?.value||'guest'));}
export async function PUT(request:NextRequest){
  const body=await request.json();
  if(!Array.isArray(body.saved)||!Array.isArray(body.shoppingList)||!body.preferences||!Array.isArray(body.preferences.allergens))return NextResponse.json({error:'Invalid state payload'},{status:400});
  const result=saveState({saved:body.saved.filter((x:unknown)=>typeof x==='string'),shoppingList:body.shoppingList.filter((x:unknown)=>typeof x==='string'),preferences:{diet:String(body.preferences.diet||'No preference'),allergens:body.preferences.allergens.filter((x:unknown)=>typeof x==='string')}});
  return NextResponse.json(result);
}
