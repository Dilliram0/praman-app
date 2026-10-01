import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/catalog';

export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim().toLocaleLowerCase();
  const category = request.nextUrl.searchParams.get('category') || 'All';
  const origin = request.nextUrl.searchParams.get('origin');
  const sort = request.nextUrl.searchParams.get('sort') || 'popular';
  let items = products.filter((p: {name:string;brand:string;category:string;origin:string;ingredients:string[]}) =>
    (category === 'All' || p.category === category) && (!origin || p.origin === origin) &&
    (!q || [p.name,p.brand,p.category,p.origin,...p.ingredients].join(' ').toLocaleLowerCase().includes(q)));
  items = sort === 'name' ? items.sort((a: {name:string},b: {name:string}) => a.name.localeCompare(b.name)) : sort === 'rating' ? items.sort((a: {score:number},b: {score:number}) => b.score-a.score) : items.sort((a: {demandRank?:number;score:number},b: {demandRank?:number;score:number}) => (a.demandRank??999)-(b.demandRank??999)||b.score-a.score);
  return NextResponse.json({ items, total: items.length });
}
