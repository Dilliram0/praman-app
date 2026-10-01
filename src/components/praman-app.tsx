'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownWideNarrow, ArrowLeft, ArrowRight, BadgeCheck, Barcode, Bookmark, Check,
  ChevronDown, ChevronRight, Droplets, Heart, House, Info, Leaf, ListChecks, Menu,
  Filter, Milk, Minus, Plus, ScanLine, Search, Share2, ShieldCheck, ShoppingBasket, Sparkles,
  Sprout, Upload, X, Zap,
} from 'lucide-react';
import { categories as catalogCategories, type Product } from '@/lib/catalog';

type Prefs = { diet:string; allergens:string[] };
type AppState = { saved:string[]; shoppingList:string[]; preferences:Prefs; submissions:{id:number;name:string;barcode:string|null;createdAt:string}[] };
type BarcodeResult = { product:Product; source:string };
type View = 'home'|'search'|'saved'|'uploads';
const blank:AppState={saved:[],shoppingList:[],preferences:{diet:'No preference',allergens:[]},submissions:[]};
const icons:Record<string,typeof House>={
  'Instant noodles':Zap,'Instant Noodles':Zap,'Chips':Sparkles,'Chocolate':Sparkles,'Chocolate/Snack':Sparkles,'Chocolate/Wafer':Sparkles,'Snacks':Sparkles,'Biscuits':Milk,'Beverages':Milk,'Dairy':Milk,
  'Breakfast':Sprout,'Staples':Leaf,'Cooking essentials':Leaf,'Personal care':Sparkles,
};
function IconBubble({children,tone='purple',size='md'}:{children:React.ReactNode;tone?:string;size?:'sm'|'md'|'lg'}){
  return <span className={`icon-bubble ${tone} ${size}`}>{children}</span>;
}
function Icon({Icon:Glyph=House,size=19}:{Icon?:typeof House;size?:number}){return <Glyph size={size} strokeWidth={2.2}/>}
function ProductPack({product:p,small=false}:{product:Product;small?:boolean}){
  return <div className={`product-pack ${small?'small':''}`} style={{'--pack-color':p.color} as React.CSSProperties}>
    {p.image?<img src={p.image} alt={`${p.name} package`} loading="lazy" onError={e=>{e.currentTarget.style.display='none';e.currentTarget.nextElementSibling?.classList.remove('hidden')}}/>:null}
    <div className={`pack-illustration ${p.image?'hidden':''}`}><b>{p.brand}</b><span>{p.emoji}</span><strong>{p.name.split(' ').slice(0,3).join(' ')}</strong></div>
  </div>;
}
function ratingName(s:number){return s>=4.1?'Excellent':s>=3.1?'Good':s>=2.1?'Okay':s>=1.1?'Poor':'Very poor'}
function ratingTone(s:number){return s>=3.1?'good':s>=2.1?'okay':s>=1.1?'poor':'bad'}

export default function PramanApp(){
  const [view,setView]=useState<View>('home');
  const [products,setProducts]=useState<Product[]>([]);
  const [appState,setAppState]=useState<AppState>(blank);
  const [selected,setSelected]=useState<Product|null>(null);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All');
  const [sort,setSort]=useState('popular');
  const [modal,setModal]=useState<'scan'|'prefs'|'upload'|null>(null);
  const [forYou,setForYou]=useState(false);
  const [perServing,setPerServing]=useState(false);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState('');
  const [prefs,setPrefs]=useState<Prefs>({diet:'No preference',allergens:[]});
  const [uploadName,setUploadName]=useState('');
  const [uploadBarcode,setUploadBarcode]=useState('');
  const [barcode,setBarcode]=useState('');
  const [cameraOn,setCameraOn]=useState(false);
  const [mobileMenu,setMobileMenu]=useState(false);
  const [barcodeResult,setBarcodeResult]=useState<BarcodeResult|null>(null);
  const [scanError,setScanError]=useState('');
  const [lookingUp,setLookingUp]=useState(false);
  const videoRef=useRef<HTMLVideoElement>(null);
  const cameraRef=useRef<MediaStream|null>(null);
  const timerRef=useRef<number|undefined>(undefined);
  const categories=catalogCategories;

  const notify=useCallback((message:string)=>{setToast(message);window.setTimeout(()=>setToast(''),2500)},[]);
  useEffect(()=>{
    Promise.all([fetch('/api/products').then(r=>r.json()),fetch('/api/state').then(r=>r.json())])
      .then(([data,state])=>{setProducts(data.items||[]);setAppState(state);setPrefs(state.preferences||blank.preferences)})
      .catch(()=>notify('Could not connect to the Praman server. Try refreshing.'))
      .finally(()=>setLoading(false));
  },[notify]);
  const persist=useCallback(async(next:AppState)=>{
    setAppState(next);setPrefs(next.preferences);
    try{const r=await fetch('/api/state',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(next)});if(!r.ok)throw new Error();setAppState(await r.json())}
    catch{notify('Could not save that change. Please retry.')}
  },[notify]);
  const loadProducts=useCallback(async(q=query,c=category,s=sort)=>{
    const params=new URLSearchParams();if(q.trim())params.set('q',q.trim());if(c!=='All')params.set('category',c);params.set('sort',s);
    const data=await fetch(`/api/products?${params}`).then(r=>r.json());setProducts(data.items||[]);
  },[query,category,sort]);
  useEffect(()=>{if(view==='search'){const id=window.setTimeout(()=>{loadProducts().catch(()=>notify('Product search is unavailable.'))},140);return()=>clearTimeout(id)}},[view,query,category,sort,loadProducts,notify]);
  const openProduct=(product:Product,personalized=false)=>{setBarcodeResult(null);setModal(null);setSelected(product);setForYou(personalized);setPerServing(false);setView('search');window.scrollTo({top:0,behavior:'smooth'})};
  const toggleSaved=(id:string)=>{const saved=appState.saved.includes(id)?appState.saved.filter(x=>x!==id):[...appState.saved,id];void persist({...appState,saved});notify(saved.includes(id)?'Saved to your products':'Removed from saved products')};
  const toggleList=(id:string)=>{const shoppingList=appState.shoppingList.includes(id)?appState.shoppingList.filter(x=>x!==id):[...appState.shoppingList,id];void persist({...appState,shoppingList});notify(shoppingList.includes(id)?'Added to your shopping list':'Removed from shopping list')};
  const chooseCategory=(c:string)=>{setCategory(c);setQuery('');setSelected(null);setView('search');setMobileMenu(false)};
  const go=(next:View)=>{setSelected(null);setView(next);setMobileMenu(false);window.scrollTo({top:0,behavior:'smooth'})};

  const stopCamera=()=>{if(timerRef.current)window.clearTimeout(timerRef.current);cameraRef.current?.getTracks().forEach(t=>t.stop());cameraRef.current=null;setCameraOn(false)};
  useEffect(()=>()=>{cameraRef.current?.getTracks().forEach(t=>t.stop());if(timerRef.current)window.clearTimeout(timerRef.current)},[]);
  const lookup=async(value=barcode)=>{
    setScanError('');setLookingUp(true);
    try{
      const r=await fetch('/api/products/lookup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({barcode:value})});const data=await r.json();
      if(!r.ok){setScanError(data.error||'No barcode match found.');return}
      setBarcode(value);stopCamera();setModal(null);setBarcodeResult({product:data.match as Product,source:data.source||'Praman catalog'});
    }catch{setScanError('Could not reach the product database. Check your connection and try again.')}
    finally{setLookingUp(false)}
  };
  const startCamera=async()=>{
    if(!navigator.mediaDevices?.getUserMedia){notify('Camera access needs a secure browser connection. Enter the barcode instead.');return}
    const Detector=(window as Window&{BarcodeDetector?:new(o?:{formats:string[]})=>{detect:(v:HTMLVideoElement)=>Promise<Array<{rawValue:string}>>}}).BarcodeDetector;
    if(!Detector){notify('This browser does not support barcode detection. Enter the number instead.');return}
    try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});cameraRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}setCameraOn(true);const detector=new Detector({formats:['ean_13','ean_8','upc_a','upc_e']});const tick=async()=>{if(!videoRef.current)return;try{const found=await detector.detect(videoRef.current);if(found[0]){setBarcode(found[0].rawValue);stopCamera();void lookup(found[0].rawValue);return}}catch{}timerRef.current=window.setTimeout(tick,250)};void tick()}
    catch{notify('Camera permission is unavailable. Enter the barcode manually.')}
  };
  const submitUpload=async()=>{const r=await fetch('/api/submissions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:uploadName,barcode:uploadBarcode||undefined})});const data=await r.json();if(!r.ok){notify(data.error||'Could not submit product');return}setAppState(s=>({...s,submissions:[data.submission,...s.submissions]}));setModal(null);setUploadName('');setUploadBarcode('');notify('Product sent for community review')};

  const nav=[{id:'home' as View,label:'Home',Icon:House},{id:'search' as View,label:'Search',Icon:Search},{id:'uploads' as View,label:'Uploads',Icon:Upload},{id:'saved' as View,label:'Saved',Icon:Bookmark}];
  const visibleProducts=view==='saved'?products.filter(p=>appState.saved.includes(p.id)):products;
  const currentSelected=selected?products.find(p=>p.id===selected.id)||selected:null;

  return <div className="praman-app">
    <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open menu" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><button className="brand" onClick={()=>go('home')}><span className="brand-mark">P</span><span>praman<span className="brand-dot">.</span></span></button><nav className="top-links">{nav.slice(0,3).map(({id,label})=><button key={id} className={view===id?'active':''} onClick={()=>go(id)}>{label}</button>)}</nav><button className="profile-avatar" aria-label="Preferences" onClick={()=>setModal('prefs')}>A</button></header>
    <div className="app-layout">
      <aside className={`sidebar ${mobileMenu?'show':''}`}>{nav.map(({id,label,Icon:Glyph})=><button key={id} className={`side-link ${view===id?'active':''}`} onClick={()=>go(id)}><IconBubble tone={view===id?'purple':'muted'}><Glyph size={19}/></IconBubble><span>{label}</span>{id==='saved'&&appState.saved.length>0&&<em>{appState.saved.length}</em>}</button>)}<button className="side-link" onClick={()=>setModal('scan')}><IconBubble tone="mint"><ScanLine size={19}/></IconBubble><span>Scan product</span></button><div className="sidebar-spacer"/><div className="plus-card"><IconBubble tone="sun"><Sparkles size={19}/></IconBubble><strong>Choices that fit you</strong><p>Save your food preferences for more personal insights.</p><button onClick={()=>setModal('prefs')}>Set preferences <ArrowRight size={15}/></button></div></aside>
      <main className="main-area">
        {loading?<div className="loading-state"><div className="spinner"/><span>Getting Praman ready…</span></div>:currentSelected?<ProductDetail product={currentSelected} products={products} state={appState} forYou={forYou} setForYou={setForYou} perServing={perServing} setPerServing={setPerServing} onBack={()=>setSelected(null)} onSave={toggleSaved} onList={toggleList} onOpen={openProduct} onPrefs={()=>setModal('prefs')}/>:view==='home'?<Home products={products} categories={categories} onSearch={(q)=>{setQuery(q);setCategory('All');go('search')}} onCategory={chooseCategory} onOpen={openProduct} onScan={()=>setModal('scan')} onPrefs={()=>setModal('prefs')} onAll={()=>go('search')} />:view==='search'?<SearchPage products={visibleProducts} categories={categories} query={query} setQuery={setQuery} category={category} setCategory={setCategory} sort={sort} setSort={setSort} onOpen={openProduct} onSave={toggleSaved} onList={toggleList} onScan={()=>setModal('scan')} />:view==='saved'?<SavedPage products={products} state={appState} onOpen={openProduct} onSave={toggleSaved} onList={toggleList} onRemove={toggleList} onClear={()=>void persist({...appState,shoppingList:[]})} notify={notify}/>:<UploadPage submissions={appState.submissions} onUpload={()=>setModal('upload')}/>}
      </main>
    </div>
    <nav className="mobile-nav">{nav.slice(0,2).map(({id,label,Icon:Glyph})=><button key={id} className={view===id&&!selected?'active':''} onClick={()=>go(id)}><Glyph size={18} strokeWidth={2.4}/><span>{label}</span></button>)}<button className="nav-scan" aria-label="Scan a barcode" onClick={()=>setModal('scan')}><ScanLine size={23} strokeWidth={2.6}/></button>{nav.slice(2).map(({id,label,Icon:Glyph})=><button key={id} className={view===id?'active':''} onClick={()=>go(id)}><Glyph size={18} strokeWidth={2.4}/><span>{label}</span></button>)}</nav>
     {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget){stopCamera();setModal(null)}}}><div className="dialog" role="dialog" aria-modal="true">{modal==='scan'?<><DialogHeader title="Scan a product" close={()=>{stopCamera();setModal(null)}}/><p className="dialog-copy">Scan the barcode or enter its digits to search the product database.</p><div className={`camera-box ${cameraOn?'live':''}`}>{cameraOn?<video ref={videoRef} muted playsInline/>:<div className="camera-placeholder"><IconBubble tone="purple" size="lg"><ScanLine size={32}/></IconBubble><span>Point your camera at a barcode</span></div>}<div className="scan-corners"/></div><button className="secondary-btn camera-action" onClick={cameraOn?stopCamera:startCamera}>{cameraOn?'Stop camera':'Start camera scan'}</button><label className="field-label" htmlFor="barcode">Barcode number</label><div className="input-with-button"><input id="barcode" value={barcode} onChange={e=>{setBarcode(e.target.value);setScanError('')}} inputMode="numeric" placeholder="Enter 8–14 digits"/><button className="primary-btn" disabled={lookingUp||!barcode} onClick={()=>void lookup()}>{lookingUp?<span className="mini-spinner"/>:<Search size={17}/>}{lookingUp?'Looking up…':'Look up'}</button></div>{scanError&&<p className="scan-error" role="alert">{scanError}</p>}</>:modal==='prefs'?<><DialogHeader title="Your preferences" close={()=>setModal(null)}/><p className="dialog-copy">Personal insights use these details to highlight things you may want to check on the package.</p><label className="field-label" htmlFor="diet">Diet preference</label><select id="diet" value={prefs.diet} onChange={e=>setPrefs(p=>({...p,diet:e.target.value}))}><option>No preference</option><option>Vegetarian</option><option>Vegan</option><option>Gluten-free</option></select><p className="field-label">Ingredients to watch</p><div className="allergen-list">{['Milk','Peanut','Soy','Gluten','Sesame','Egg'].map(a=><label key={a} className={prefs.allergens.includes(a)?'checked':''}><input type="checkbox" checked={prefs.allergens.includes(a)} onChange={()=>setPrefs(p=>({...p,allergens:p.allergens.includes(a)?p.allergens.filter(x=>x!==a):[...p.allergens,a]}))}/>{a}</label>)}</div><div className="dialog-footer"><button className="secondary-btn" onClick={()=>setModal(null)}>Cancel</button><button className="primary-btn" onClick={()=>{void persist({...appState,preferences:prefs});setModal(null);notify('Preferences saved')}}><Check size={17}/>Save preferences</button></div></>:<><DialogHeader title="Contribute a product" close={()=>setModal(null)}/><p className="dialog-copy">Help us build a better Nepal product catalog. Submissions are marked pending review.</p><label className="field-label" htmlFor="product-name">Product name</label><input id="product-name" value={uploadName} onChange={e=>setUploadName(e.target.value)} maxLength={100} placeholder="e.g. a local snack or drink"/><label className="field-label" htmlFor="upload-barcode">Barcode (optional)</label><input id="upload-barcode" value={uploadBarcode} onChange={e=>setUploadBarcode(e.target.value)} inputMode="numeric" placeholder="Barcode digits"/><div className="dialog-footer"><button className="secondary-btn" onClick={()=>setModal(null)}>Cancel</button><button className="primary-btn" onClick={()=>void submitUpload()}><Upload size={17}/>Submit for review</button></div></>}</div></div>}
     {barcodeResult&&<BarcodeResultSheet result={barcodeResult} saved={appState.saved.includes(barcodeResult.product.id)} listed={appState.shoppingList.includes(barcodeResult.product.id)} onClose={()=>setBarcodeResult(null)} onSave={()=>toggleSaved(barcodeResult.product.id)} onList={()=>toggleList(barcodeResult.product.id)} onDetails={()=>openProduct(barcodeResult.product)}/>}
    {toast&&<div className="toast" role="status"><BadgeCheck size={18}/>{toast}</div>}
  </div>;
}

function Home({products,categories,onSearch,onCategory,onOpen,onScan,onPrefs,onAll}:{products:Product[];categories:string[];onSearch:(q:string)=>void;onCategory:(c:string)=>void;onOpen:(p:Product)=>void;onScan:()=>void;onPrefs:()=>void;onAll:()=>void}){
  const [q,setQ]=useState('');const [showAllCategories,setShowAllCategories]=useState(false);const popular=products.filter(p=>p.demandRank!==undefined).sort((a,b)=>(a.demandRank??999)-(b.demandRank??999)).slice(0,20);const picks=products.filter(p=>p.origin==='Nepal'&&p.score>=4).slice(0,4);const activeCategories=categories.filter(x=>x!=='All');const shownCategories=showAllCategories?activeCategories:activeCategories.slice(0,6);
  return <><section className="hero"><div className="hero-copy"><h1>Know what you choose.</h1><p>Clearer product choices for everyday Nepal.</p></div><IconBubble tone="hero" size="lg"><Sprout size={35}/></IconBubble><form className="hero-search" onSubmit={e=>{e.preventDefault();onSearch(q)}}><Search size={21}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, brands or ingredients"/><button type="submit">Explore <ArrowRight size={15}/></button></form><div className="hero-foot">Need a quick answer? <button onClick={onScan}><ScanLine size={15}/> Scan a barcode</button></div></section>
    <div className="section-heading"><div><h2>Start with what matters</h2></div><button className="text-link" onClick={onPrefs}>Personalize <ArrowRight size={15}/></button></div>
    <div className="feature-grid"><button className="feature-card purple-card" onClick={onPrefs}><IconBubble tone="soft-purple" size="lg"><Sparkles size={25}/></IconBubble><span><b>Insights for you</b><small>Set your food preferences</small></span><ArrowRight size={18}/></button><button className="feature-card mint-card" onClick={onScan}><IconBubble tone="soft-mint" size="lg"><ScanLine size={25}/></IconBubble><span><b>Scan something</b><small>Read a barcode in seconds</small></span><ArrowRight size={18}/></button></div>
    <div className="section-heading compact"><div><h2>Popular categories</h2></div><button className="text-link" onClick={()=>setShowAllCategories(v=>!v)}>{showAllCategories?'Less':'More'} <ChevronDown size={14}/></button></div><div className="category-chips">{shownCategories.map(c=>{const Glyph=icons[c]||Sparkles;return <button key={c} className="category-chip" onClick={()=>onCategory(c)}><IconBubble tone="category" size="sm"><Glyph size={16}/></IconBubble>{c}<ChevronRight size={14}/></button>})}</div>
    <div className="section-heading"><div><h2>Most demanded products</h2></div><button className="text-link" onClick={onAll}>See all <ArrowRight size={15}/></button></div><div className="product-grid">{popular.map(p=><ProductCard key={p.id} product={p} onOpen={onOpen}/>)}</div>
    <div className="section-heading"><div><h2>Better-rated local picks</h2></div><button className="text-link" onClick={onAll}>Browse products <ArrowRight size={15}/></button></div><div className="product-grid">{picks.map(p=><ProductCard key={p.id} product={p} onOpen={onOpen}/>)}</div><p className="disclaimer">Praman is an educational product guide. Check the package for current ingredients, allergen and nutrition information.</p>
  </>;
}

function ProductCard({product:p,onOpen,onSave,onList,active=false}:{product:Product;onOpen:(p:Product)=>void;onSave?:(id:string)=>void;onList?:(id:string)=>void;active?:boolean}){
  return <article className="product-card"><button className="product-open" onClick={()=>onOpen(p)} aria-label={`View ${p.name}`}><div className="card-photo"><ProductPack product={p}/><span className={`rating-pill ${ratingTone(p.score)}`}>{p.score.toFixed(1)} <span>/ 5</span></span></div><div className="product-copy"><span className="product-brand">{p.brand} · {p.origin==='Nepal'?'Nepal':'Popular'}</span><h3>{p.name}</h3><div className="card-bottom"><span className="score-label"><i className={ratingTone(p.score)}/>{ratingName(p.score)}</span><b>Rs. {p.price}</b></div></div></button>{(onSave||onList)&&<div className="card-actions">{onSave&&<button className={active?'is-saved':''} aria-label={active?'Remove saved product':'Save product'} onClick={()=>onSave(p.id)}><Heart size={18} fill={active?'currentColor':'none'}/></button>}{onList&&<button aria-label="Add to shopping list" onClick={()=>onList(p.id)}><ListChecks size={18}/></button>}</div>}</article>;
}

function BarcodeResultSheet({result,saved,listed,onClose,onSave,onList,onDetails}:{result:BarcodeResult;saved:boolean;listed:boolean;onClose:()=>void;onSave:()=>void;onList:()=>void;onDetails:()=>void}){
  const p=result.product;
  return <div className="barcode-result-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="barcode-result-sheet" role="dialog" aria-modal="true" aria-labelledby="barcode-result-title"><div className="sheet-handle"/><div className="barcode-result-top"><span className="result-category">{p.category}</span><button className="icon-button" aria-label="Close scan result" onClick={onClose}><X size={18}/></button></div><div className="barcode-result-card"><div className="result-pack"><ProductPack product={p}/></div><div className="result-product-copy"><h2 id="barcode-result-title">{p.name}</h2><p>{p.brand}{p.barcode?` · ${p.barcode}`:''}</p><strong className={`result-rating ${ratingTone(p.score)}`}><b>{p.score.toFixed(1)}</b><span>Out of 5<br/>{ratingName(p.score)}</span></strong></div><div className="result-actions"><button className={saved?'is-saved':''} aria-label={saved?'Remove from saved products':'Save product'} onClick={onSave}><Heart size={21} fill={saved?'currentColor':'none'}/></button><button className={listed?'is-saved':''} aria-label={listed?'Remove from shopping list':'Add to shopping list'} onClick={onList}><ListChecks size={20}/></button></div></div><p className="result-source">Barcode match · {result.source}</p><div className="barcode-result-footer"><button className="primary-btn" onClick={onDetails}>View details <ChevronRight size={17}/></button></div></section></div>;
}

function SearchPage({products,categories,query,setQuery,category,setCategory,sort,setSort,onOpen,onSave,onList,onScan}:{products:Product[];categories:string[];query:string;setQuery:(s:string)=>void;category:string;setCategory:(s:string)=>void;sort:string;setSort:(s:string)=>void;onOpen:(p:Product)=>void;onSave:(id:string)=>void;onList:(id:string)=>void;onScan:()=>void}){
  return <><div className="page-title-row"><div><h1>Explore products</h1><p>{products.length} products in the Praman catalog</p></div><button className="secondary-btn scan-cta" onClick={onScan}><IconBubble tone="purple" size="sm"><ScanLine size={17}/></IconBubble>Scan a product</button></div><div className="search-toolbar"><div className="catalog-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands or ingredients"/><button aria-label="Clear search" onClick={()=>setQuery('')}><X size={16}/></button></div><div className="search-options"><label className="filter-control"><Filter size={16}/><select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c} value={c}>{c==='All'?'All categories':c}</option>)}</select><ChevronDown size={15}/></label><label className="filter-control"><ArrowDownWideNarrow size={16}/><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">Most demanded</option><option value="rating">Rating: high to low</option><option value="name">Name: A to Z</option></select><ChevronDown size={15}/></label></div></div><div className="product-grid">{products.length?products.map(p=><ProductCard key={p.id} product={p} onOpen={onOpen} onSave={onSave} onList={onList}/>):<div className="empty-state"><IconBubble tone="soft-purple" size="lg"><Search size={27}/></IconBubble><h3>No matching products</h3><p>Try another product name, ingredient or category.</p><button className="secondary-btn" onClick={()=>{setQuery('');setCategory('All')}}>Clear filters</button></div>}</div><p className="disclaimer">Search includes demo catalog data. Product facts and scores are illustrative and should be checked against packaging.</p></>;
}

function ProductDetail({product:p,products,state,forYou,setForYou,perServing,setPerServing,onBack,onSave,onList,onOpen,onPrefs}:{product:Product;products:Product[];state:AppState;forYou:boolean;setForYou:(b:boolean)=>void;perServing:boolean;setPerServing:(b:boolean)=>void;onBack:()=>void;onSave:(id:string)=>void;onList:(id:string)=>void;onOpen:(p:Product)=>void;onPrefs:()=>void}){
  const [showAllNutrients,setShowAllNutrients]=useState(false);
  const [showAllNutritionDetails,setShowAllNutritionDetails]=useState(false);
  const [showAllIngredients,setShowAllIngredients]=useState(false);
  const alternatives=products.filter(x=>x.category===p.category&&x.id!==p.id&&x.score>p.score).sort((a,b)=>b.score-a.score).slice(0,5);
  const pref=state.preferences;
  const dietMatches=pref.diet==='No preference'||pref.diet==='Vegetarian'&&!/chicken|meat|fish/i.test(p.name)||pref.diet==='Vegan'&&!/milk|dairy|cheese/i.test(p.name+' '+p.ingredients)||pref.diet==='Gluten-free'&&!p.ingredients.some(x=>/wheat|gluten/i.test(x));
  const allergyMatch=!pref.allergens.some(a=>p.ingredients.some(i=>i.toLowerCase().includes(a.toLowerCase())));
  const n=p.nutrition;const scale=perServing?.5:1;
  const sugars=Number(n.sugar||0);const addedSugar=Math.min(sugars,Math.round(sugars*.75*10)/10);
  const carbs=Math.max(0,Math.round((48+sugars)*10)/10);
  const energy=Math.round((carbs*4+Number(n.protein||0)*4+Number(n.fat||0)*9));
  const sodium=Math.round(Number(n.salt||0)/2.5);
  const transFat=p.processing==='Ultra-processed'?.1:0;
  const cholesterol=p.category==='Dairy'?12:0;
  const additives=p.ingredients.filter(x=>/INS\s?\d|E\d{3,4}|flavou?r enhancer|preservative|artificial/i.test(x)).length;
  const factor=(v:number,decimals=1)=>(v*scale).toFixed(decimals);
  const tones={concern:'soft-coral',good:'soft-mint',neutral:'soft-purple'};
  const glyphs:Record<string,typeof House>={Additives:Sparkles,Energy:Zap,'Total sugars':Sprout,'Added sugars':Sprout,'Total fat':Droplets,Carbohydrates:Leaf,Protein:Sprout,'Dietary fiber':Leaf,'Trans fat':Droplets,Cholesterol:Milk,Sodium:Milk,Salt:Milk};
  const nutrientRow=(label:string,value:string,unit:string,detail:string,tone:'concern'|'good'|'neutral'='neutral')=>{const Glyph=glyphs[label]||Info;return <details className="nutrition-item" key={label}><summary><span className="nutrition-label"><IconBubble tone={tones[tone]} size="sm"><Glyph size={16}/></IconBubble><b>{label}</b></span><strong className={`nutrition-value ${tone}`}>{value}{unit&&` ${unit}`}</strong><ChevronDown size={16}/></summary><p>{detail}</p></details>};
  const share=async()=>{const text=`${p.name} · Praman rating ${p.score.toFixed(1)}/5`;try{if(navigator.share)await navigator.share({title:p.name,text});else await navigator.clipboard.writeText(text)}catch{}};
  return <div className="detail-page">
    <div className="detail-toolbar"><button className="back-link" onClick={onBack}><ArrowLeft size={18}/> Back</button><div><button className="detail-toolbar-action" aria-label="Share product" onClick={()=>void share()}><Share2 size={19}/></button><button className="detail-toolbar-action" aria-label="Add to shopping list" onClick={()=>onList(p.id)}><ListChecks size={19}/></button></div></div>
    <div className="detail-product"><span className="detail-category-tag">{p.category==='Personal care'?'Personal care':'Food'}</span><ProductPack product={p}/><div className="detail-product-info"><span className="product-brand">{p.brand} · {p.category}</span><h1>{p.name}</h1><div className="detail-subline"><span>{p.origin==='Nepal'?'Made in Nepal 🇳🇵':'Available in Nepal'}</span>{p.price>0&&<span>Rs. {p.price}</span>}</div></div><div className="detail-actions"><button className={`round-action ${state.saved.includes(p.id)?'is-saved':''}`} onClick={()=>onSave(p.id)} aria-label={state.saved.includes(p.id)?'Remove from saved':'Save product'}><Heart size={20} fill={state.saved.includes(p.id)?'currentColor':'none'}/></button></div></div>
    <div className="segmented"><button className={!forYou?'selected':''} onClick={()=>setForYou(false)}>Basic Info</button><button className={forYou?'selected':''} onClick={()=>setForYou(true)}><Sparkles size={15}/> For You</button></div>
    {forYou?<section className="detail-panel personal-panel"><div className={`match-banner ${dietMatches&&allergyMatch?'match':'review'}`}><IconBubble tone={dietMatches&&allergyMatch?'soft-mint':'sun'}><ShieldCheck size={20}/></IconBubble><span><b>{dietMatches&&allergyMatch?'Looks aligned with your preferences':'Worth a closer label check'}</b><small>Personal insights are based on your saved profile.</small></span></div><h2>Your preference profile</h2><div className="nutrient-row"><span>Diet preference</span><b>{pref.diet||'Not set'}</b></div><div className="nutrient-row"><span>Allergen watchlist</span><b>{pref.allergens.join(', ')||'Not set'}</b></div><h2>Personal notes</h2>{n.sugar>10&&<div className="insight-row"><IconBubble tone="sun" size="sm"><Zap size={15}/></IconBubble><span>Check total sugars</span><b>{n.sugar} g / 100 g</b></div>}{n.salt>600&&<div className="insight-row"><IconBubble tone="soft-coral" size="sm"><Info size={15}/></IconBubble><span>Salt is on the higher side</span><b>{(n.salt/1000).toFixed(1)} g / 100 g</b></div>}<p className="helper-note">Always confirm ingredient and allergen details on the current package.</p><button className="secondary-btn" onClick={onPrefs}>Edit preferences</button></section>:<>
      <div className="rating-summary"><IconBubble tone="purple" size="lg"><span className="praman-mini">P</span></IconBubble><span><b>Praman Rating</b><small>Based on ingredient and nutrition signals</small></span><strong className={`rating-large ${ratingTone(p.score)}`}>{p.score.toFixed(1)}<small>{ratingName(p.score)}</small></strong></div>
      <div className="serving-toggle"><button className={!perServing?'selected':''} onClick={()=>setPerServing(false)}>Per 100 g</button><button className={perServing?'selected':''} onClick={()=>setPerServing(true)}>Per 50 g</button><Info size={18}/></div>
      <section className="detail-panel nutrition-panel"><h2>What should concern you? <span>😯</span></h2><div className="processing-row"><span><Zap size={17}/> Processing level</span><b className={p.score<2?'processing-high':''}>{p.processing}</b></div>{p.score<2.1?<p className="concern-copy">This product has a low Praman rating. Consider limiting how often you choose it.</p>:<p className="concern-copy">Review these label details in the context of your overall diet.</p>}
        {nutrientRow('Additives',String(additives),'',additives?`${additives} ingredient label item${additives===1?'':'s'} matched common additive terms. Check the package for the full list.`:'No common additive terms were identified in the listed ingredients.','concern')}
        {nutrientRow('Energy',factor(energy),'kcal','Estimated from the catalog nutrition values per 100 g.','neutral')}
        {nutrientRow('Total sugars',factor(sugars),'g','Total sugars listed in the catalog nutrition values.','concern')}
        {nutrientRow('Added sugars',factor(addedSugar),'g','Illustrative estimate based on total sugars; verify the package label.','concern')}
        {nutrientRow('Total fat',factor(n.fat),'g','Total fat listed in the catalog nutrition values.','concern')}
        {showAllNutrients&&<>{nutrientRow('Carbohydrates',factor(carbs),'g','Illustrative catalog estimate; values may differ from the product label.','neutral')}{nutrientRow('Salt',factor(Number(n.salt||0)/1000),'g','Salt per 100 g from the catalog nutrition values.','concern')}</>}
        <button className="detail-disclosure" onClick={()=>setShowAllNutrients(v=>!v)}>{showAllNutrients?'Show less':'View all'} <ChevronDown size={16}/></button>
      </section>
      <section className="detail-panel like-panel"><h2>What you’ll like <span>🙂</span></h2>
        {nutrientRow('Protein',factor(n.protein),'g','Protein per 100 g from the catalog nutrition values.','good')}
        {nutrientRow('Dietary fiber',factor(n.fiber),'g','Dietary fiber per 100 g from the catalog nutrition values.','good')}
        {nutrientRow('Trans fat',factor(transFat),'g','Illustrative value only; check the nutrition panel on the package.','good')}
        {nutrientRow('Cholesterol',factor(cholesterol),'mg','Illustrative value only; check the nutrition panel on the package.','good')}
        {nutrientRow('Sodium',factor(sodium),'mg','Estimated from the catalog salt value.','good')}
        {showAllNutritionDetails&&<>{nutrientRow('Carbohydrates',factor(carbs),'g','Illustrative catalog estimate; verify against the package nutrition panel.','neutral')}{nutrientRow('Total sugars',factor(sugars),'g','Total sugars per 100 g.','concern')}{nutrientRow('Total fat',factor(n.fat),'g','Total fat per 100 g.','concern')}{nutrientRow('Energy',factor(energy),'kcal','Estimated from the catalog nutrition values.','neutral')}{nutrientRow('Salt',factor(Number(n.salt||0)/1000),'g','Salt per 100 g.','concern')}</>}
        <button className="detail-disclosure all-nutrients-toggle" onClick={()=>setShowAllNutritionDetails(v=>!v)}>{showAllNutritionDetails?'Hide extra nutrients':'All nutrients'} <ChevronRight size={16}/></button>
        <div className="ingredients-block"><h3>Ingredients</h3><div className="ingredient-chips">{(showAllIngredients?p.ingredients:p.ingredients.slice(0,5)).map(i=><span key={i}>{i}</span>)}</div><button className="detail-disclosure" onClick={()=>setShowAllIngredients(v=>!v)}>{showAllIngredients?'Show fewer ingredients':'All ingredients'} <ChevronRight size={16}/></button><p className="helper-note">Product label details in this demo catalog may be incomplete. Confirm ingredients on the package.</p></div>
      </section>
      <section className="alternatives-section"><div className="section-heading"><div><h2>Better rated options</h2><p>{p.category}</p></div><button className="text-link" onClick={onBack}>Category results <ArrowRight size={15}/></button></div>{alternatives.length?<div className="product-grid alternative-grid">{alternatives.slice(0,4).map(a=><ProductCard key={a.id} product={a} onOpen={onOpen}/>)}</div>:<div className="empty-inline">This product is among the highest rated in its category.</div>}</section>
      <p className="disclaimer">Praman is an educational product guide. Scores and some nutrient values are illustrative and are not verified product testing.</p>
    </>}
  </div>;
}
function SavedPage({products,state,onOpen,onSave,onList,onRemove,onClear,notify}:{products:Product[];state:AppState;onOpen:(p:Product)=>void;onSave:(id:string)=>void;onList:(id:string)=>void;onRemove:(id:string)=>void;onClear:()=>void;notify:(s:string)=>void}){
  const saved=products.filter(p=>state.saved.includes(p.id)),list=state.shoppingList.map(id=>products.find(p=>p.id===id)).filter((p):p is Product=>!!p),total=list.reduce((sum,p)=>sum+p.price,0);
  const copy=async()=>{if(!list.length){notify('Your shopping list is empty');return}const text=list.map(p=>`${p.name} — Rs. ${p.price}`).join('\n')+`\nEstimated total: Rs. ${total}`;try{await navigator.clipboard.writeText(text);notify('Shopping list copied')}catch{notify(text)}};
  return <><div className="page-title-row"><div><h1>Saved products</h1><p>Keep an eye on products you may want to compare.</p></div><IconBubble tone="soft-purple" size="lg"><Bookmark size={24}/></IconBubble></div><div className="product-grid">{saved.length?saved.map(p=><ProductCard key={p.id} product={p} onOpen={onOpen} onSave={onSave} onList={onList} active/>):<div className="empty-state"><IconBubble tone="soft-purple" size="lg"><Heart size={26}/></IconBubble><h3>No saved products yet</h3><p>Save a product with the heart button to keep it here.</p></div>}</div><div className="section-heading list-heading"><div><h2>Shopping list <span className="count-pill">{list.length}</span></h2></div><button className="text-link" onClick={onClear}>Clear list</button></div><section className="shopping-list">{list.length?list.map(p=><div className="shopping-row" key={p.id}><ProductPack product={p} small/><span><b>{p.name}</b><small>{p.brand}</small></span><strong>Rs. {p.price}</strong><button className="icon-button remove-item" onClick={()=>onRemove(p.id)} aria-label="Remove from list"><Minus size={18}/></button></div>):<div className="list-empty"><ShoppingBasket size={25}/><span>Your list is empty. Add products with the list icon.</span></div>}<div className="list-total"><span>Estimated total</span><b>Rs. {total}</b></div>{list.length>0&&<button className="primary-btn" onClick={()=>void copy()}><Share2 size={17}/>Copy shopping list</button>}</section></>;
}

function UploadPage({submissions,onUpload}:{submissions:AppState['submissions'];onUpload:()=>void}){
  return <><div className="page-title-row"><div><h1>Community uploads</h1><p>Help us make product information more useful for Nepal.</p></div><IconBubble tone="soft-mint" size="lg"><Upload size={25}/></IconBubble></div><section className="upload-banner"><IconBubble tone="purple" size="lg"><Barcode size={27}/></IconBubble><div><h2>Add a product to Praman</h2><p>Submit its name and barcode. We’ll mark it for review.</p></div><button className="primary-btn" onClick={onUpload}><Plus size={18}/>Contribute product</button></section><div className="section-heading list-heading"><div><h2>Submissions</h2></div><span className="status-tag"><span/>Pending review</span></div><section className="shopping-list">{submissions.length?submissions.map(s=><div className="submission-row" key={s.id}><IconBubble tone="soft-purple" size="sm"><Barcode size={16}/></IconBubble><span><b>{s.name}</b><small>{s.barcode||'No barcode provided'}</small></span><em>Pending review</em></div>):<div className="list-empty"><Upload size={24}/><span>Your product submissions will appear here.</span></div>}</section><p className="disclaimer">Submissions are stored locally in this app’s database and shown with a pending review status.</p></>;
}

function DialogHeader({title,close}:{title:string;close:()=>void}){return <div className="dialog-header"><div><IconBubble tone="purple"><Sparkles size={17}/></IconBubble><h2>{title}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={close}><X size={19}/></button></div>}


