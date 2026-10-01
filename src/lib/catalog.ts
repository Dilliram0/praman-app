export type Product = {
  id: string; name: string; brand: string; category: string; origin: string;
  score: number; price: number; image?: string; color: string; emoji: string;
  barcode?: string; demandRank?: number;
  ingredients: string[]; nutrition: { sugar: number; salt: number; fat: number; protein: number; fiber: number };
  processing: string;
};
import { productImages } from './product-images';

const rows: Array<[string,string,string,string,string,number,number,string,string,string?]> = [
  ['waiwai-chicken','Wai Wai Noodles','Wai Wai','Instant Noodles','Nepal',1.8,25,'#dc2943','🍜','8906013030015'],
  ['waiwai-veg','Wai Wai Vegetable Noodles','Wai Wai','Instant Noodles','Nepal',1.9,25,'#e9b92e','🍜','8906013030022'],
  ['waiwai-xpress','Wai Wai Xpress Noodles','Wai Wai','Instant Noodles','Nepal',1.6,30,'#e9473c','🍜','8906013030367'],
  ['rara-chicken','Rara Instant Noodles','Rara','Instant Noodles','Nepal',1.7,25,'#dc3544','🍜'],
  ['mayos-veg','Mayos Noodles','Mayos','Instant Noodles','Nepal',1.8,25,'#edbd31','🍜'],
  ['rumpum-chicken','Rum Pum Noodles','Rum Pum','Instant Noodles','Nepal',1.7,25,'#e87831','🍜'],
  ['2pm-akabare','2PM Noodles','2PM','Instant Noodles','Nepal',1.4,35,'#e34731','🌶️'],
  ['pringles','Pringles Original','Pringles','Chips & Snacks','Global',1.5,350,'#d62238','🥔'],
  ['lays','Lay’s Classic','Lay’s','Chips & Snacks','Global',1.5,50,'#e6b932','🥔'],
  ['parleg','Parle-G Biscuits','Parle','Biscuits','South Asia',1.9,20,'#d79a3a','🍪'],
  ['mariegold','Britannia Marie Gold','Britannia','Biscuits','South Asia',3.1,35,'#dfa83c','🍪'],
  ['goodday','Britannia Good Day','Britannia','Biscuits','South Asia',1.7,50,'#e3a536','🍪'],
  ['oreo','Oreo Choco Creme','Oreo','Biscuits','Global',1.6,50,'#3154a1','🍪'],
  ['dairy-milk','Cadbury Dairy Milk','Cadbury','Chocolate','South Asia',1.7,50,'#59348d','🍫'],
  ['kitkat','KitKat','Nestlé','Chocolate','Global',1.8,50,'#d9272e','🍫'],
  ['snickers','Snickers','Mars','Chocolate','Global',1.7,80,'#493428','🍫'],
  ['choco-pie','Orion Choco Pie','Orion','Chocolate','South Asia',1.6,35,'#a74d32','🍰'],
  ['5star','Cadbury 5 Star','Cadbury','Chocolate','South Asia',1.6,30,'#6c4697','🍫'],
  ['munch','Nestlé Munch','Nestlé','Chocolate','South Asia',1.6,25,'#d8a92b','🍫'],
  ['perk','Cadbury Perk','Cadbury','Chocolate','South Asia',1.7,25,'#da4935','🍫'],
  ['waiwai-cheese','Wai Wai Quick Cheese Noodles','CG Foods','Instant noodles','Nepal',1.7,50,'#ed7c2e','🧀'],
  ['current-3x','Current 3X Spicy Noodles','Yashoda Foods','Instant noodles','Nepal',1.3,35,'#bd2029','🌶️'],
  ['kwiks-chicken','Kwik’s Chicken Crackers','Kwik’s','Chips & Snacks','Nepal',1.5,20,'#e85322','🍗'],
  ['momo-masala','Wai Wai Quick Chicken Pizza Noodles','Wai Wai','Instant Noodles','Nepal',1.7,20,'#eabd35','🍜'],
  ['coke','Coca-Cola Original','Coca-Cola','Beverages','Global',1.7,100,'#e12732','🥤'],
  ['fanta','Fanta Orange','Coca-Cola','Beverages','Global',1.9,100,'#f28b18','🍊'],
  ['sprite','Sprite Lemon-Lime','Coca-Cola','Beverages','Global',2.0,100,'#49ae55','🍋'],
  ['real-orange','Real Fruit Power Orange','Dabur','Beverages','South Asia',2.7,120,'#f07b27','🧃'],
  ['tropicana','Tropicana Mixed Fruit','PepsiCo','Beverages','South Asia',2.6,130,'#ec8a27','🧃'],
  ['redbull','Red Bull Energy Drink','Red Bull','Beverages','Global',1.8,180,'#d82c37','⚡'],
  ['ddc-milk','DDC Pasteurized Milk','DDC','Dairy','Nepal',4.2,100,'#4c85c6','🥛'],
  ['ddc-paneer','DDC Paneer','DDC','Dairy','Nepal',4.0,220,'#f5cc67','🧀'],
  ['waiwai-chips','Kwik’s Hot & Spicy Potato Chips','Kwik’s','Chips & Snacks','Nepal',1.3,50,'#e5ab21','🥔'],
  ['current-cheese','Current Cheese Balls','Yashoda Foods','Chips & Snacks','Nepal',1.4,30,'#f08419','🧀'],
  ['kurkure','Kurkure Masala Munch','PepsiCo','Chips & Snacks','South Asia',1.4,30,'#eb6c20','🥨'],
  ['bhujia','Haldiram Aloo Bhujia','Haldiram','Chips & Snacks','South Asia',1.7,100,'#e69a20','🥜'],
  ['kwality-marie','Kwality Marie Biscuits','Kwality','Biscuits','Nepal',3.5,30,'#d9ac56','🍪'],
  ['hulas-digestive','Nebico D-20 Digestive Biscuits','Nebico','Biscuits','Nepal',3.2,20,'#a7773c','🍪'],
  ['chocofun','Sujal ChocoFun Wafer','Sujal Foods','Biscuits','Nepal',1.5,50,'#e64b43','🍫'],
  ['darkfantasy','Sunfeast Dark Fantasy','ITC','Biscuits','South Asia',1.5,100,'#4b332d','🍫'],
  ['cornflakes','Kellogg’s Corn Flakes','Kellogg’s','Breakfast & Staples','Global',3.2,450,'#e7ac2c','🌽'],
  ['quaker-oats','Quaker Oats','PepsiCo','Breakfast & Staples','Global',4.4,600,'#75a954','🌾'],
  ['sampann-dal','Tata Sampann Toor Dal','Tata Consumer','Breakfast & Staples','South Asia',4.3,230,'#b89941','🫘'],
  ['fortune-oil','Fortune Sunflower Oil','AWL Agri','Cooking Essentials','South Asia',2.8,250,'#edbd32','🫗'],
  ['hjava','Himalayan Java Coffee','Himalayan Java','Beverages','Nepal',3.6,450,'#7b4a31','☕'],
  ['nepal-tea','Nepal Tea Premium CTC','Nepal Tea','Beverages','Nepal',4.4,180,'#8c6240','🍵'],
  ['aqua100','Aqua 100 Himalayan Spring Water','Aqua 100','Beverages','Nepal',4.5,30,'#43a9cb','💧'],
  ['lapsi-candy','Rato Bhale Sweet Lapsi Candy','Rato Bhale','Chips & Snacks','Nepal',1.8,50,'#d23c50','🍬'],
  ['kwality-icecream','Kwality Vanilla Ice Cream','Kwality','Dairy','Nepal',3.3,300,'#8d69c5','🍦'],
  ['aaha-rice','Nepal Foods Basmati Rice','Nepal Foods','Breakfast & Staples','Nepal',4.1,260,'#bba660','🍚'],
  ['himalaya-facewash','Himalaya Neem Face Wash','Himalaya','Personal care','South Asia',3.6,220,'#6ca658','🧴'],
  ['dove-soap','Dove Beauty Bar','Unilever','Personal care','Global',3.2,140,'#5b84c6','🧼'],
  ['sunsilk','Sunsilk Shampoo','Unilever','Personal care','Global',2.8,250,'#d64b91','🧴'],
  ['closeup','Closeup Red Hot Toothpaste','Unilever','Personal care','Global',2.6,140,'#e94a42','🪥'],
];

function details(category: string, index: number) {
  const ingredients = category.toLowerCase() === 'instant noodles' ? ['Wheat flour (maida)','Palm oil','Salt','Seasoning mix','Flavour enhancer (INS 621)','Spices']
    : category === 'Beverages' ? ['Water','Sugar','Acidity regulator (INS 330)','Flavouring substances']
    : category === 'Personal care' ? ['Aqua','Glycerin','Sodium Laureth Sulfate','Fragrance','Preservative']
    : category === 'Chips & Snacks' ? ['Potato / corn base','Vegetable oil','Salt','Seasoning','Flavour enhancer (INS 621)']
    : category === 'Dairy' ? ['Milk','Milk solids','Culture'] : ['Whole grain / flour','Vegetable oil','Sugar','Salt'];
  return { ingredients, nutrition: { sugar:[1.2,4.5,8,12,18,22][index%6], salt:[250,400,520,650,780,900][index%6], fat:[2,5,8,12,16][index%5], protein:[2,4,7,11,15,22][index%6], fiber:[.8,1.5,2.2,3.8,5.2][index%5] }, processing:['Ultra-processed','Processed','Minimally processed'][index%3] };
}

export const products: Product[] = rows.map((r, i) => {
  const [id,name,brand,category,origin,score,price,color,emoji,barcode] = r;
  const demandRank=['waiwai-chicken','waiwai-veg','waiwai-xpress','rara-chicken','mayos-veg','rumpum-chicken','2pm-akabare','pringles','lays','parleg','mariegold','goodday','oreo','dairy-milk','kitkat','snickers','choco-pie','5star','munch','perk'].indexOf(id)+1;
  return { id,name,brand,category,origin,score,price,color,emoji,barcode,demandRank:demandRank||undefined,...details(category,i),image:productImages[id] };
});

export const categories = ['All','Instant Noodles','Chips & Snacks','Biscuits','Chocolate','Beverages','Dairy','Breakfast & Staples','Cooking Essentials','Personal care'];
