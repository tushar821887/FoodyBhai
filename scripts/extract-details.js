const fs = require('fs');

const data = JSON.parse(fs.readFileSync('zomato_full_menu_parsed.json', 'utf8'));
const menus = data.pages.restaurant['21538699'].order.menuList.menus;

console.log('Total menus:', menus.length);

const result = [];

menus.forEach(mObj => {
  const menu = mObj.menu;
  console.log(`\nMenu: "${menu.name}" (categories: ${menu.categories?.length || 0})`);
  
  menu.categories?.forEach(cObj => {
    const cat = cObj.category;
    console.log(`  SubCategory: "${cat.name}" (items: ${cat.items?.length || 0})`);
    
    cat.items?.forEach(iObj => {
      const it = iObj.item;
      const isMacaroni = /macaroni|macroni/i.test(it.name) || /macaroni|macroni/i.test(it.desc);
      const isNavratri = /navratri/i.test(menu.name) || /vrat/i.test(cat.name) || /vrat/i.test(it.name) || /navratri/i.test(it.name);
      
      if (isMacaroni || isNavratri) {
        result.push({
          menuName: menu.name,
          categoryName: cat.name,
          id: it.id,
          name: it.name,
          price: it.price || it.min_price || it.default_price,
          desc: it.desc,
          image: it.thumb_url || it.image_url || it.item_image_url || it.media?.[0]?.url || it.dish_image_url,
          tag: isMacaroni ? 'Macaroni' : 'Navratri'
        });
      }
    });
  });
});

console.log(`\nFound ${result.length} matching items!`);
fs.writeFileSync('extracted_target_items.json', JSON.stringify(result, null, 2));
console.log('Saved extracted_target_items.json');
