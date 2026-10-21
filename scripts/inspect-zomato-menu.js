const fs = require('fs');

const data = JSON.parse(fs.readFileSync('zomato_full_menu_parsed.json', 'utf8'));

// Explore sections and menu
const pageData = data.pages?.restaurant?.[Object.keys(data.pages.restaurant || {})[0]]?.sections?.SECTION_ORDER_ONLINE || {};
console.log('Order Online Section keys:', Object.keys(pageData));

// Check entities
const menus = data.entities?.menus || {};
console.log('Menus count:', Object.keys(menus).length);

const dishes = data.entities?.dishes || {};
console.log('Dishes count:', Object.keys(dishes).length);

// Let's print out all categories/sections
const menuCategories = [];
if (pageData.menus) {
  pageData.menus.forEach(m => {
    menuCategories.push({
      id: m.id,
      name: m.name,
      categoriesCount: m.categories?.length
    });
  });
}
console.log('Menu Categories in pageData:', JSON.stringify(menuCategories, null, 2));

// Search dishes for "macroni", "macaroni", "navratri"
console.log('\nSearching in dishes:');
Object.values(dishes).forEach(d => {
  const name = d.name || '';
  const desc = d.desc || '';
  if (/macroni|macaroni|navratri|vrat/i.test(name) || /macroni|macaroni|navratri|vrat/i.test(desc)) {
    console.log({
      id: d.id,
      name: d.name,
      price: d.price,
      desc: d.desc,
      category_id: d.category_id,
      min_price: d.min_price,
      default_price: d.default_price,
      image_url: d.thumb_url || d.image_url || d.media?.length
    });
  }
});

// Let's also search for all categories in pageData.items or menus
if (pageData.items) {
  console.log('Total items in pageData.items:', pageData.items.length);
}
