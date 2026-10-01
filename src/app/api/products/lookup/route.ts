import { NextRequest, NextResponse } from 'next/server';
import { allProducts } from '@/lib/db';
import type { Product } from '@/lib/catalog';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const {barcode}=await request.json() as {barcode?:string};
  if (!barcode || !/^\d{8,14}$/.test(barcode)) return NextResponse.json({error:'Enter a valid 8–14 digit barcode.'},{status:400});
  const local=allProducts().find((p:{barcode?:string})=>p.barcode===barcode);
  if(local)return NextResponse.json({match:local,source:'Praman catalog'});
  try {
    const response=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,{headers:{'User-Agent':'Praman/1.0 (Nepal product guide)'},signal:AbortSignal.timeout(4500),next:{revalidate:86400}});
    if(response.ok){
      const data=await response.json();
      if(data.status===1&&data.product){
        const p=data.product;const n=p.nutriments||{};const categoryText=[p.categories,p.categories_tags?.join(' ')].filter(Boolean).join(' ').toLowerCase();
        const category=categoryText.includes('noodle')?'Instant Noodles':categoryText.includes('beverage')||categoryText.includes('drink')?'Beverages':categoryText.includes('biscuit')||categoryText.includes('cookie')?'Biscuits':categoryText.includes('chocolate')?'Chocolate':categoryText.includes('chip')||categoryText.includes('snack')?'Chips & Snacks':categoryText.includes('dairy')||categoryText.includes('milk')?'Dairy':'Packaged food';
        const ingredients=Array.isArray(p.ingredients)?p.ingredients.map((x:{text?:string})=>x.text).filter((x:string|undefined):x is string=>Boolean(x)):String(p.ingredients_text_en||p.ingredients_text||'').split(/,\s*/).filter(Boolean);
        const saltG=Number(n.salt_100g??(Number(n.sodium_100g||0)*2.5));const sugar=Number(n.sugars_100g||0);const fat=Number(n.fat_100g||0);const protein=Number(n.proteins_100g||0);const fiber=Number(n.fiber_100g||0);
        const grade=String(p.nutrition_grades||'').toLowerCase();const gradeScore:Record<string,number>={a:4.6,b:3.9,c:3.1,d:1.9,e:.9};
        const score=gradeScore[grade]??Math.max(.5,Math.min(5,Number((4.5-Math.min(4,sugar*.06+saltG*.45+fat*.03+(Number(p.additives_n||0)*.08)+(Number(p.nova_group||0)>=4?.4:0))).toFixed(1))));
        const match:Product={id:`scan-${barcode}`,name:p.product_name||p.product_name_en||'Scanned product',brand:String(p.brands||'Brand not listed').split(',')[0].trim(),category,origin:String(p.countries||'').toLowerCase().includes('nepal')?'Nepal':'Popular',score,price:0,image:p.image_front_url||p.image_front_small_url||p.image_url||undefined,color:'#6840c6',emoji:'📦',barcode,ingredients:ingredients.length?ingredients:['Check package label'],nutrition:{sugar,salt:Math.round(saltG*1000),fat,protein,fiber},processing:Number(p.nova_group||0)>=4?'Ultra-processed':Number(p.nova_group||0)>=2?'Processed':'Minimally processed'};
        return NextResponse.json({match,source:'Open Food Facts · Praman estimate'});
      }
    }
  } catch { /* network may be unavailable; still search local catalog */ }
  return NextResponse.json({error:'No exact match found yet. Try searching the product name or contribute its label.'},{status:404});
}
