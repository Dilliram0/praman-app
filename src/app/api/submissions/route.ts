import { NextRequest, NextResponse } from 'next/server';
import { addSubmission, getState } from '@/lib/db';
export const runtime = 'nodejs';
export async function GET(){return NextResponse.json((await getState()).submissions);}
export async function POST(request:NextRequest){
  const {name,barcode}=await request.json() as {name?:string;barcode?:string};
  const clean=name?.trim();
  if(!clean||clean.length>100)return NextResponse.json({error:'Add a product name of 1–100 characters.'},{status:400});
  if(barcode&& !/^\d{8,14}$/.test(barcode))return NextResponse.json({error:'Barcode must contain 8–14 digits.'},{status:400});
  return NextResponse.json({submission:await addSubmission(clean,barcode||null),status:'pending review'},{status:201});
}
