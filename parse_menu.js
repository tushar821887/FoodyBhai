const fs = require('fs');

const rawData = `
| **Main Course**           | South Indian Poha (Full)                |  ₹109 | A delightful twist on the classic poha, this South Indian version features soft, flavorful poha.         |
|                           | Paneer Butter Masala                    |  ₹229 | Paneer cubes in a creamy tomato gravy, flavored with aromatic spices.                                    |
|                           | Dal Tadka                               |  ₹199 | Lentils tempered with garlic, cumin and red chilli, served with steamed rice.                            |
|                           | Dal Fry                                 |  ₹179 | A comforting Indian classic made with perfectly cooked lentils, tempered with aromatic spices.           |
|                           | Aloo Jeera Masala                       |   ₹79 | A simple yet flavorful Indian dish made with boiled potatoes and aromatic cumin.                         |
|                           | Paneer Do Pyaaza                        |  ₹249 | A classic North Indian delicacy offering a perfect balance of tangy, spicy and flavorful notes.          |
|                           | Paneer Lababdar                         |  ₹229 | A mildly spiced, velvety North Indian delicacy that pairs beautifully with Indian breads or rice.        |
|                           | Peri Peri Fries                         |  ₹119 | Crispy golden fries tossed in spicy and flavorful peri peri seasoning.                                   |
|                           | Matar Paneer                            |  ₹209 | Soft paneer cubes and tender green peas cooked in a rich, flavorful tomato gravy.                        |
|                           | Aloo Sabzi with Gravy                   |   ₹99 | Soft, tender potatoes cooked in a flavorful, aromatic onion-tomato gravy with traditional Indian spices. |
| **Puri & Sabzi**          | 4 Puri + Aloo Sabzi                     |   ₹99 | 4 hot and fluffy puris served with delicious, mildly spiced aloo sabzi.                                  |
|                           | 6 Puri + Aloo Sabzi                     |  ₹119 | 6 freshly prepared puris paired with flavorful aloo sabzi.                                               |
|                           | 6 Puri + Sabzi + Raita                  |  ₹139 | Hot and fluffy puris with homestyle aloo sabzi, served with refreshing creamy raita.                     |
|                           | 4 Special Puri + Sabzi                  |  ₹129 | A special Foody Bhai-style puri meal with crispy puris and flavorful masala aloo sabzi.                  |
| **Rice**                  | Steam Rice                              |   ₹79 | Special boiled rice in home cooked style.                                                                |
|                           | Jeera Rice                              |   ₹89 | Fragrant, long grain basmati rice cooked to perfection and tempered with earthy cumin.                   |
|                           | Fried Rice                              |  ₹119 | Aromatic basmati rice stir fried with fresh vegetables, flavorful sauces and authentic Chinese flavors.  |
| **Everyday Essentials**   | Tawa Roti with Butter                   |   ₹15 | Soft, freshly prepared whole wheat tawa roti, generously topped with rich, melted butter.                |
|                           | Tawa Roti Ghee Wali                     |   ₹12 | Soft, freshly prepared whole wheat rotis generously brushed with pure ghee.                              |
|                           | Tawa Roti                               |   ₹10 | Soft, thin and wholesome, tawa roti is a classic Indian flatbread made from whole wheat.                 |
|                           | Plain Butter Paratha                    |   ₹37 | Plain butter paratha is a crispy and flavorful Indian flatbread generously finished with butter.         |
|                           | Plain Paneer Paratha                    |   ₹59 | Soft and flaky whole wheat flatbread stuffed with a mildly spiced paneer filling.                        |
|                           | Paneer Paratha with Butter              |   ₹69 | Delicious stuffed Indian flatbread filled with flavorful paneer and finished with butter.                |
|                           | Aloo Paratha                            |   ₹56 | Popular North Indian flatbread stuffed with a spiced potato filling.                                     |
|                           | Aloo Pyaaz Paratha                      |   ₹66 | Popular North Indian stuffed flatbread filled with a flavorful potato and onion mixture.                 |
|                           | Gobi Paratha                            |   ₹72 | Hearty and flavorful Indian flatbread stuffed with a spiced mixture of cauliflower.                      |
|                           | Mixed Veggie Paratha                    |   ₹79 | Soft and flaky whole wheat flatbread stuffed with a delicious mixed vegetable filling.                   |
|                           | Aloo Paneer Pyaaz Paratha               |   ₹84 | Hearty stuffed paratha packed with a delicious mixture of mashed potato, paneer and onion.               |
|                           | Royal Aloo Pyaaz Paratha                |  ₹110 | A king-sized delight packed with rich, flavorful mashed potatoes, aromatic spices and onion.             |
| **Snacks**                | Red Sauce Pasta                         |  ₹119 | Popular Italian-style pasta served with a rich and flavorful red tomato sauce.                           |
|                           | Masala Macaroni                         |  ₹109 | Boiled macaroni sautéed with aromatic spices and flavorful masala.                                       |
|                           | Bhel Puri North Indian Style (Full)     |   ₹70 | Popular tangy and flavorful North Indian-style street food snack.                                        |
|                           | Plain Maggi                             |   ₹49 | Classic Maggi noodles loved for their quick preparation and delicious taste.                             |
|                           | Mix Veggie Maggi                        |   ₹89 | Flavorful and nutritious Maggi noodles prepared with mixed vegetables and spices.                        |
|                           | Mix Veg Maggie with Butter              |  ₹119 | Hot and delicious Maggi noodles tossed with fresh mixed vegetables, aromatic spices and butter.          |
|                           | Peri Peri Maggi                         |  ₹110 | Hot and delicious Maggi noodles tossed with bold peri peri seasoning and aromatic spices.                |
| **Fresh Salad**           | Fresh Kheera, Tomato & Onion Salad      |   ₹29 | Freshly sliced cucumber, juicy tomatoes and onion rings, lightly seasoned and served fresh.              |
|                           | Kheera Salad                            |   ₹29 | Freshly sliced cucumber, lightly seasoned and served fresh.                                              |
|                           | Onion Salad                             |   ₹29 | Fresh onion rings served with light seasoning.                                                           |
|                           | Tomato Salad                            |   ₹29 | Juicy tomato slices, freshly cut and lightly seasoned.                                                   |
| **Raita And Sides**       | Boondi Raita                            |   ₹45 | Creamy yogurt mixed with crispy boondi and seasoned with roasted cumin and black salt.                   |
|                           | Mix Veg Raita                           |   ₹59 | Thick, chilled yogurt blended with fresh cucumber, onion, tomato and mild Indian spices.                 |
|                           | Plain Raita                             |   ₹39 | Smooth and creamy chilled yogurt lightly seasoned with roasted cumin and a pinch of spices.              |
| **Drinks & Beverages**    | Masala Shikanji                         |   ₹30 | Traditional Indian lemonade made with fresh lemon juice, chilled water and refreshing spices.            |
| **Special Combos**        | Dal Chawal Combo                        |  ₹239 | A well-balanced and nutritious meal of flavorful dal served with rice.                                   |
|                           | Dal with 4 Roti                         |  ₹209 | A filling and comforting combination of flavorful dal served with 4 freshly prepared rotis.              |
|                           | Dal with Chawal and 4 Roti              |  ₹289 | Wholesome Indian meal featuring flavorful yellow dal, rice and 4 freshly prepared rotis.                 |
|                           | Paneer Butter Masala with 4 Roti        |  ₹249 | Rich and creamy paneer butter masala served with 4 freshly prepared rotis.                               |
|                           | Aloo Jeera Masala With Raita and 4 Roti |  ₹139 | Flavorful aloo jeera masala served with creamy raita and 4 soft, freshly prepared rotis.                 |
|                           | Red Sauce Pasta + Macroni               |  ₹149 | Delicious pasta and macaroni tossed in a rich, tangy red tomato sauce.                                   |
| **Thalis And Mini Meals** | Paneer Masala + 4 Roti + Salad          |  ₹139 | Flavorful paneer masala served with 4 freshly made rotis and fresh salad.                                |
|                           | Dal + 4 Roti + Jeera Aloo + Salad       |  ₹169 | Wholesome meal featuring homestyle dal, 4 freshly made rotis, jeera aloo and salad.                      |
|                           | Dal + Chawal + Salad                    |  ₹159 | Comforting and wholesome meal of flavorful homestyle dal served with freshly cooked rice and salad.      |
`;

const images = [
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
];

let id = 1;
const recipes = [];
const lines = rawData.trim().split('\n');
let currentCategory = '';

for (const line of lines) {
  if (!line.trim() || !line.includes('|')) continue;
  
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 5) continue;
  
  let cat = parts[1].replace(/\*\*/g, '');
  if (cat) currentCategory = cat;
  else cat = currentCategory;
  
  const title = parts[2];
  let priceStr = parts[3];
  const desc = parts[4];
  
  if (!title) continue;
  
  const priceMatch = priceStr.match(/\d+/);
  const price = priceMatch ? parseInt(priceMatch[0]) : 0;
  
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  const img = images[id % images.length];

  recipes.push({
    id,
    slug,
    title,
    description: desc,
    introduction: desc,
    category: cat,
    cuisine: 'Indian',
    prepTime: '10 mins',
    cookTime: '15 mins',
    totalTime: '25 mins',
    servings: 1,
    difficulty: 'Easy',
    ingredients: [],
    instructions: [],
    tips: [],
    image: img,
    imageAlt: title,
    seoTitle: title + ' | Foody Bhai',
    seoDescription: desc,
    isVeg: true,
    price: price
  });
  
  id++;
}

console.log(JSON.stringify(recipes, null, 2));

