const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const newDishes = [
  // ─── 1. Macaroni Items ───
  {
    title: "Masala Macaroni",
    slug: "masala-macaroni",
    category: "Snacks",
    price: 109,
    description: "Boiled macaroni pasta sautéed with a flavorful mixture of onions, fresh tomatoes, and green chillies. Seasoned with aromatic Indian spices like turmeric, cumin, and garam masala for a tangy, desi twist.",
    introduction: "Desi style Masala Macaroni is a beloved Indian street and home snack. Tender elbow macaroni is tossed in a spicy, buttery onion-tomato masala spiced with chaat masala, turmeric, and fresh herbs.",
    cuisine: "Indo-Western",
    prepTime: "10 mins",
    cookTime: "15 mins",
    totalTime: "25 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "2 cups Elbow Macaroni pasta (boiled al dente)",
      "1 large Onion, finely chopped",
      "2 medium Tomatoes, finely chopped or pureed",
      "1 Green chilli, finely chopped",
      "1 tsp Ginger-garlic paste",
      "1/2 tsp Cumin seeds (Jeera)",
      "1/2 tsp Turmeric powder (Haldi)",
      "1/2 tsp Red chilli powder",
      "1 tsp Garam masala powder",
      "1/2 tsp Pav bhaji masala or Chaat masala",
      "2 tbsp Butter or Cooking oil",
      "Fresh coriander leaves, finely chopped",
      "Salt to taste"
    ],
    instructions: [
      "Boil macaroni in salted water with 1 tsp oil until tender (al dente). Drain and rinse with cool water.",
      "Heat butter or oil in a pan over medium heat. Add cumin seeds and let them splutter.",
      "Add chopped onions and green chillies; sauté until golden and translucent.",
      "Add ginger-garlic paste and sauté for 1 minute until fragrant.",
      "Add chopped tomatoes, turmeric, red chilli, salt, and garam masala. Cook on medium flame until tomatoes turn mushy and oil separates.",
      "Add the boiled macaroni to the masala. Toss well on medium heat until every pasta piece is coated thoroughly.",
      "Garnish with chopped fresh coriander leaves and a dash of lemon juice. Serve hot!"
    ],
    tips: [
      "Do not overcook the macaroni while boiling; keep it slightly firm.",
      "Adding a small cube of butter at the end enhances the silky texture and aroma."
    ],
    image: "https://b.zmtcdn.com/data/dish_photos/7b6/52b9c30359a4f66d1dcea88849a8d7b6.jpg",
    imageAlt: "Masala Macaroni Foody Bhai",
    seoTitle: "Masala Macaroni | Foody Bhai Meerut",
    seoDescription: "Order delicious Desi Masala Macaroni with spicy onion-tomato gravy from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Red Sauce Pasta + Macroni",
    slug: "red-sauce-pasta-macroni",
    category: "Special Combos",
    price: 149,
    description: "Delicious pasta and macaroni tossed in a rich, tangy red tomato sauce, blended with aromatic herbs, spices, and fresh vegetables. A flavorful, cheesy and comforting Italian-style treat.",
    introduction: "A fusion delight combining penne pasta and macaroni tossed together in our chef-special slow-simmered arrabbiata tomato sauce with oregano, chilli flakes, and sautéed garden veggies.",
    cuisine: "Italian Fusion",
    prepTime: "10 mins",
    cookTime: "15 mins",
    totalTime: "25 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 cup Penne Pasta & 1 cup Elbow Macaroni (boiled)",
      "3 large Ripe Tomatoes (blanched and pureed)",
      "1 medium Capsicum / Bell pepper, diced",
      "1 small Onion, finely chopped",
      "4 cloves Garlic, minced",
      "1 tsp Dried Oregano & Italian herbs",
      "1/2 tsp Red Chilli flakes",
      "1 tbsp Tomato ketchup (for balance)",
      "2 tbsp Extra virgin olive oil or butter",
      "Grated Cheese for garnish (optional)",
      "Salt and freshly crushed black pepper to taste"
    ],
    instructions: [
      "Boil the penne pasta and macaroni together in salted boiling water until al dente. Drain and set aside.",
      "Heat olive oil or butter in a wide pan. Sauté minced garlic until aromatic without browning.",
      "Add chopped onions and capsicum, sautéing for 2-3 minutes until slightly tender.",
      "Pour in the fresh tomato puree. Add oregano, chilli flakes, black pepper, ketchup, and salt.",
      "Simmer the sauce on medium-low flame for 6-8 minutes until thick and glossy.",
      "Add the boiled pasta and macaroni into the hot red sauce. Toss gently for 2 minutes so the sauce clings to every curve.",
      "Serve hot garnished with grated cheese and fresh herbs."
    ],
    tips: [
      "Reserve half a cup of pasta cooking water to adjust the red sauce consistency if needed.",
      "Use ripe red tomatoes for a naturally vibrant, sweet and tangy flavor."
    ],
    image: "https://b.zmtcdn.com/data/dish_photos/3e6/7285238fdd8e70920b4fed76346743e6.jpg",
    imageAlt: "Red Sauce Pasta Macroni Combo Foody Bhai",
    seoTitle: "Red Sauce Pasta + Macroni Combo | Foody Bhai Meerut",
    seoDescription: "Order tangy cheesy Red Sauce Pasta and Macaroni combo online from Foody Bhai.",
    isVeg: true,
    inStock: true
  },

  // ─── 2. Navratri Special Category Items ───
  {
    title: "4 Kuttu Aloo Paratha + Curd + Aloo Sabzi",
    slug: "4-kuttu-aloo-paratha-curd-aloo-sabzi",
    category: "Navratri Special",
    price: 221,
    description: "Enjoy a delicious Navratri fasting combo featuring golden kuttu aloo parathas served with vrat wale aloo and refreshing plain curd. Prepared with fasting-friendly ingredients and sendha namak, without onion or garlic.",
    introduction: "A complete wholesome fasting meal for Navratri! Nutritious buckwheat (kuttu) parathas stuffed with potato mash, paired with authentic cumin-seasoned fasting potato curry and fresh chilled curd.",
    cuisine: "Vrat Special",
    prepTime: "15 mins",
    cookTime: "15 mins",
    totalTime: "30 mins",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "4 Kuttu Aloo Parathas (made with buckwheat flour & mashed potatoes)",
      "1 bowl Vrat Wale Aloo Sabzi with cumin, green chillies, and sendha namak",
      "1 bowl Fresh Plain Curd (dahi)",
      "Pure desi ghee for shallow frying",
      "Sendha Namak (Rock Salt)",
      "Fresh coriander leaves"
    ],
    instructions: [
      "Prepare soft dough using kuttu (buckwheat) flour, boiled mashed potatoes, and rock salt.",
      "Roll gently and cook parathas on a hot tawa with desi ghee until golden-brown and crisp.",
      "Prepare fasting potato sabzi tempered with cumin, green chillies, ginger, and tomatoes with rock salt.",
      "Plate 4 hot parathas alongside a bowl of steaming aloo sabzi and cold plain curd."
    ],
    tips: ["Boiled potatoes help bind buckwheat flour perfectly without tearing."],
    image: "https://b.zmtcdn.com/data/dish_photos/827/88c76ba3f384888d624a741f2747b827.jpeg",
    imageAlt: "4 Kuttu Aloo Paratha Combo Foody Bhai",
    seoTitle: "4 Kuttu Aloo Paratha + Curd + Aloo Sabzi | Foody Bhai Navratri Special",
    seoDescription: "Order authentic Navratri fasting meal with 4 Kuttu Aloo Parathas, Curd, and Aloo Sabzi from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "4 Kuttu Paratha with Curd",
    slug: "4-kuttu-paratha-with-curd",
    category: "Navratri Special",
    price: 139,
    description: "Enjoy freshly prepared kuttu parathas, cooked until golden in pure ghee and served with a side of cool, creamy curd. A wholesome Navratri fasting meal made with fasting-friendly ingredients and sendha namak, without onion or garlic.",
    introduction: "Crisp and golden buckwheat flatbreads cooked in pure ghee, accompanied by thick, cooling homemade curd seasoned with roasted cumin and rock salt.",
    cuisine: "Vrat Special",
    prepTime: "10 mins",
    cookTime: "15 mins",
    totalTime: "25 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "4 Kuttu Parathas",
      "1 bowl Fresh Creamy Curd",
      "Roasted Cumin Powder (Bhuna Jeera)",
      "Sendha Namak (Rock Salt)",
      "Pure Desi Ghee"
    ],
    instructions: [
      "Knead kuttu flour with rock salt and lukewarm water into a smooth dough.",
      "Roll out round parathas and shallow fry with pure desi ghee on tawa till crisp on both sides.",
      "Serve piping hot with a bowl of refreshing cold curd."
    ],
    tips: ["Use pure desi ghee for the authentic festive flavor and divine aroma."],
    image: "https://b.zmtcdn.com/data/dish_photos/f6c/dc129988972a93e4c8792899e6c82f6c.jpeg",
    imageAlt: "4 Kuttu Paratha with Curd Foody Bhai",
    seoTitle: "4 Kuttu Paratha with Curd | Foody Bhai Navratri Special",
    seoDescription: "Nutritious and delicious 4 Kuttu Paratha with Curd for Navratri vrat by Foody Bhai.",
    isVeg: true,
    inStock: true
  },
  {
    title: "4 Kuttu Poori with Aloo Sabzi",
    slug: "4-kuttu-poori-with-aloo-sabzi",
    category: "Navratri Special",
    price: 159,
    description: "Enjoy crispy golden kuttu pooris served with delicious vrat wale aloo sabzi, seasoned with fasting-friendly spices and sendha namak. A satisfying traditional Navratri meal, prepared without onion or garlic.",
    introduction: "Puffed, deep-fried buckwheat pooris paired with spicy, gravy-rich fasting potato curry. The definitive festive breakfast and meal across North India.",
    cuisine: "Vrat Special",
    prepTime: "10 mins",
    cookTime: "15 mins",
    totalTime: "25 mins",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "4 Puffed Kuttu Pooris",
      "1 portion Vrat Wale Tari Aloo Sabzi",
      "Green chillies & Ginger",
      "Rock Salt (Sendha Namak)",
      "Refined Groundnut Oil or Ghee for frying"
    ],
    instructions: [
      "Roll buckwheat dough discs and deep fry in hot ghee/oil until puffed and golden.",
      "Simmer boiled potatoes in a spiced tomato-cumin broth seasoned with rock salt.",
      "Serve hot pooris immediately with the warm, comforting aloo sabzi."
    ],
    tips: ["Fry pooris on high heat so they puff up instantly without absorbing excess oil."],
    image: "https://b.zmtcdn.com/data/dish_photos/1a7/45c1e6038a39ebbd7bd6a7ec637b61a7.jpeg",
    imageAlt: "4 Kuttu Poori with Aloo Sabzi Foody Bhai",
    seoTitle: "4 Kuttu Poori with Aloo Sabzi | Foody Bhai Meerut",
    seoDescription: "Traditional fasting favourite 4 Kuttu Poori and Aloo Sabzi for Navratri from Foody Bhai.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Vrat Special Thali",
    slug: "vrat-special-thali",
    category: "Navratri Special",
    price: 201,
    description: "Celebrate Navratri with our delicious Vrat Special Thali, featuring crispy kuttu pooris, vrat wale aloo sabzi, and creamy curd. A satisfying festive meal prepared with fasting-friendly ingredients and sendha namak, without onion or garlic.",
    introduction: "The ultimate Navratri feast platter! Carefully prepared strictly following satvik fasting principles with no onion, no garlic, and pure rock salt.",
    cuisine: "Vrat Special",
    prepTime: "15 mins",
    cookTime: "20 mins",
    totalTime: "35 mins",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "4 Crispy Kuttu Pooris",
      "Vrat Wale Aloo Sabzi (gravy)",
      "Samak Rice Khichdi or Roasted Makhana",
      "Fresh Sweet/Plain Curd",
      "Fasting Green Chutney",
      "Sendha Namak"
    ],
    instructions: [
      "Assemble freshly cooked kuttu pooris, piping hot aloo sabzi, curd, and fasting accompaniments in an authentic thali presentation."
    ],
    tips: ["A complete, balanced, and energy-packed fasting platter."],
    image: "https://b.zmtcdn.com/data/dish_photos/9f0/279b2ef158cdb17d182fe9717892f9f0.jpg",
    imageAlt: "Vrat Special Thali Foody Bhai",
    seoTitle: "Vrat Special Thali Online | Foody Bhai Meerut",
    seoDescription: "Order pure vegetarian Navratri Vrat Special Thali online from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Roasted Makhana",
    slug: "roasted-makhana",
    category: "Navratri Special",
    price: 139,
    description: "Enjoy crunchy roasted makhana, lightly seasoned with fasting-friendly spices and sendha namak for a delicious and satisfying snack. Perfect for Navratri vrat or guilt-free munching, with a delightful crunch in every bite.",
    introduction: "Fox nuts (phool makhana) slow-roasted in desi ghee till ultra-crisp, lightly dusted with sendha namak and roasted cumin powder.",
    cuisine: "Vrat Snacks",
    prepTime: "5 mins",
    cookTime: "10 mins",
    totalTime: "15 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "2 cups Premium Lotus Seeds (Phool Makhana)",
      "1 tbsp Pure Desi Ghee",
      "1/2 tsp Sendha Namak (Rock Salt)",
      "1/4 tsp Roasted Jeera Powder",
      "1/4 tsp Black Pepper powder"
    ],
    instructions: [
      "Heat desi ghee in a heavy kadai on low flame.",
      "Add makhana and roast continuously on low heat for 8-10 minutes until super crisp.",
      "Toss with rock salt, black pepper, and roasted cumin powder. Serve warm."
    ],
    tips: ["Roast slowly on low flame to ensure deep crunchiness from center to outer crust."],
    image: "https://b.zmtcdn.com/data/dish_photos/2b4/8a3a455f8c98c79a7042b860df7132b4.jpeg",
    imageAlt: "Roasted Makhana Vrat Snack Foody Bhai",
    seoTitle: "Roasted Makhana Vrat Snack | Foody Bhai",
    seoDescription: "Crispy ghee-roasted Makhana snack with rock salt for fasting from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Fruit Chaat",
    slug: "fruit-chaat",
    category: "Navratri Special",
    price: 89,
    description: "A refreshing mix of freshly cut red apples and sweet bananas, served without masala or added spices. A simple, naturally sweet and wholesome fruit snack, perfect for enjoying during Navratri fasting.",
    introduction: "Freshly sliced seasonal fruits prepared hygienically under strict satvik guidelines for fasting customers.",
    cuisine: "Healthy Snacks",
    prepTime: "10 mins",
    cookTime: "0 mins",
    totalTime: "10 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 Fresh Crisp Apple, diced",
      "2 Ripe Bananas, sliced",
      "Optional Sendha Namak & Lemon wedge on side"
    ],
    instructions: [
      "Wash, peel, and dice fresh apples and bananas.",
      "Mix gently in a sanitized bowl and serve chilled immediately."
    ],
    tips: ["Prepared fresh upon order to keep fruits crisp and bright."],
    image: "https://b.zmtcdn.com/data/dish_photos/ad5/2e13e6fbba4cb853beb3819e2ddddad5.jpeg",
    imageAlt: "Fruit Chaat Navratri Foody Bhai",
    seoTitle: "Fresh Fruit Chaat | Foody Bhai Meerut",
    seoDescription: "Freshly cut healthy Fruit Chaat for Navratri fasting from Foody Bhai.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Vrat Ki Khichdi",
    slug: "vrat-ki-khichdi",
    category: "Navratri Special",
    price: 149,
    description: "Enjoy comforting vrat chawal ki khichdi made with samak rice, tender potatoes, cumin and fresh coriander. Lightly seasoned and full of traditional flavour, this wholesome dish is perfect for Navratri fasting.",
    introduction: "Samak rice (barnyard millet) cooked with potatoes, cumin seeds, green chillies, and rock salt in pure desi ghee. Light on the stomach and deeply nourishing.",
    cuisine: "Vrat Special",
    prepTime: "10 mins",
    cookTime: "15 mins",
    totalTime: "25 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 cup Samak Rice (Vrat ke chawal), rinsed",
      "1 medium Potato, boiled and cubed",
      "1 Green chilli, chopped",
      "1/2 tsp Cumin seeds",
      "1 tbsp Desi Ghee",
      "Sendha Namak to taste",
      "Fresh coriander leaves"
    ],
    instructions: [
      "Heat ghee in a pan, add cumin seeds and green chillies.",
      "Add cubed potatoes and sauté for 2 minutes.",
      "Add rinsed samak rice and 2.5 cups water with sendha namak.",
      "Cover and cook on low heat for 10-12 minutes until fluffy. Garnish with coriander."
    ],
    tips: ["Pair with cool plain curd for a heavenly meal."],
    image: "https://b.zmtcdn.com/data/dish_photos/cbc/63f449a77094fa324c2ccce07f65fcbc.jpeg",
    imageAlt: "Vrat Ki Khichdi Samak Rice Foody Bhai",
    seoTitle: "Vrat Ki Khichdi (Samak Rice) | Foody Bhai Meerut",
    seoDescription: "Authentic Vrat Ki Khichdi with Samak rice and desi ghee from Foody Bhai.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Plain Curd (Vrat Special)",
    slug: "plain-curd-vrat-special",
    category: "Navratri Special",
    price: 49,
    description: "Enjoy fresh, creamy plain curd with a smooth texture and refreshing taste. A perfect accompaniment to your meal, vrat ki khichdi, paratha or any Indian thali.",
    introduction: "Freshly set thick whole-milk dahi prepared cleanly without any contamination, perfect for vrat meals.",
    cuisine: "Accompaniments",
    prepTime: "2 mins",
    cookTime: "0 mins",
    totalTime: "2 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 bowl Fresh Chilled Thick Curd (Dahi)"
    ],
    instructions: [
      "Whisk gently for a silky smooth finish and serve chilled."
    ],
    tips: ["Pairs wonderfully with spicy fasting aloo sabzi and kuttu parathas."],
    image: "https://b.zmtcdn.com/data/dish_photos/ea9/e6fc552d72c2757bb4c62d54691aeea9.jpeg",
    imageAlt: "Plain Curd Vrat Special Foody Bhai",
    seoTitle: "Plain Curd | Foody Bhai Meerut",
    seoDescription: "Fresh creamy curd for fasting and meals from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Kuttu Aloo Paratha",
    slug: "kuttu-aloo-paratha-single",
    category: "Navratri Special",
    price: 35,
    description: "A delicious fasting-special paratha made with kuttu (buckwheat) flour and flavorful mashed potato stuffing, seasoned with sendha namak and vrat-friendly spices. Cooked in ghee and served hot.",
    introduction: "Single hot and crispy buckwheat flatbread stuffed with savory spiced potato mash, pan-fried in pure ghee.",
    cuisine: "Vrat Special",
    prepTime: "5 mins",
    cookTime: "8 mins",
    totalTime: "13 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "Buckwheat (Kuttu) flour",
      "Boiled mashed potatoes",
      "Green chillies & Ginger",
      "Sendha Namak",
      "Pure Desi Ghee"
    ],
    instructions: [
      "Mix potato mash and buckwheat flour with sendha namak.",
      "Roll gently between sheets or palms and cook on medium flame with ghee till speckled with golden crusts."
    ],
    tips: ["Eat hot off the pan while the crust is delightfully crispy."],
    image: "https://b.zmtcdn.com/data/dish_photos/bd9/c32232bee7bddd16f158cc02b7a95bd9.jpeg",
    imageAlt: "Kuttu Aloo Paratha Foody Bhai",
    seoTitle: "Kuttu Aloo Paratha | Foody Bhai Meerut",
    seoDescription: "Crispy ghee Kuttu Aloo Paratha for Navratri fasting from Foody Bhai.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Plain Kuttu Paratha",
    slug: "plain-kuttu-paratha-single",
    category: "Navratri Special",
    price: 30,
    description: "A delicious traditional Kuttu Paratha made with nutritious buckwheat flour, seasoned with sendha namak and cooked to golden perfection. A simple, wholesome and tasty choice for your Navratri fasting meals.",
    introduction: "Light, healthy, gluten-free buckwheat bread pan-toasted with ghee and rock salt.",
    cuisine: "Vrat Special",
    prepTime: "5 mins",
    cookTime: "8 mins",
    totalTime: "13 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "Pure Kuttu Atta",
      "Sendha Namak",
      "Desi Ghee"
    ],
    instructions: [
      "Roll dough and toast on iron tawa with pure ghee until crisp."
    ],
    tips: ["Rich in dietary fiber and essential minerals."],
    image: "https://b.zmtcdn.com/data/dish_photos/a18/51e92699dfd895fba71c1877e28eba18.jpeg",
    imageAlt: "Plain Kuttu Paratha Foody Bhai",
    seoTitle: "Plain Kuttu Paratha | Foody Bhai Meerut",
    seoDescription: "Traditional Plain Kuttu Paratha for Navratri from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "4 Kuttu Poori",
    slug: "4-kuttu-poori-portion",
    category: "Navratri Special",
    price: 99,
    description: "Crispy and delicious Kuttu Poori made with buckwheat flour and sendha namak. Deep-fried to golden perfection, these traditional Navratri fasting pooris are a tasty treat for your vrat meals.",
    introduction: "Portion of 4 deep-fried buckwheat pooris with an irresistible golden crunch.",
    cuisine: "Vrat Special",
    prepTime: "8 mins",
    cookTime: "10 mins",
    totalTime: "18 mins",
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      "Kuttu flour dough with mashed potato binder",
      "Sendha Namak",
      "Oil/Ghee for deep frying"
    ],
    instructions: [
      "Puff pooris in hot oil on medium-high flame until crisp and buoyant."
    ],
    tips: ["Serve hot alongside curd or aloo gravy."],
    image: "https://b.zmtcdn.com/data/dish_photos/dac/66a8f37c4f42c40fb2bdf4a6bd4ebdac.jpeg",
    imageAlt: "4 Kuttu Poori Foody Bhai",
    seoTitle: "4 Kuttu Poori | Foody Bhai Meerut",
    seoDescription: "Crispy 4 Kuttu Pooris for Navratri fasting from Foody Bhai.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Vrat Wale Aloo",
    slug: "vrat-wale-aloo-dry",
    category: "Navratri Special",
    price: 99,
    description: "Delicious vrat wale aloo made with tender potatoes, mild fasting spices, sendha namak and fresh coriander. A flavourful Navratri special, prepared without onion or garlic and perfect for your fasting meals.",
    introduction: "Sautéed dry potato cubes tossed with cumin seeds, green chillies, fresh ginger slivers, and rock salt.",
    cuisine: "Vrat Special",
    prepTime: "10 mins",
    cookTime: "10 mins",
    totalTime: "20 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "3 Boiled Potatoes, peeled and cubed",
      "1 tsp Cumin seeds",
      "2 Green chillies, slit",
      "1 inch Ginger, finely julienned",
      "1 tbsp Desi Ghee",
      "Sendha Namak",
      "1 tbsp Fresh lemon juice & coriander"
    ],
    instructions: [
      "Heat ghee, splutter cumin seeds, ginger, and green chillies.",
      "Add boiled potato cubes and toss on high heat for 5 minutes until crispy on edges.",
      "Sprinkle rock salt and fresh coriander. Finish with lemon juice."
    ],
    tips: ["A versatile dish enjoyed with parathas, pooris, or on its own."],
    image: "https://b.zmtcdn.com/data/dish_photos/f1c/484cf42f5e23fdbb0252f99d685c3f1c.jpeg",
    imageAlt: "Vrat Wale Aloo Foody Bhai",
    seoTitle: "Vrat Wale Aloo | Foody Bhai Meerut",
    seoDescription: "Flavorful Jeera Vrat Wale Aloo for fasting from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Vrat Aloo Sabzi Gravy",
    slug: "vrat-aloo-sabzi-gravy",
    category: "Navratri Special",
    price: 129,
    description: "Enjoy tender potatoes simmered in a flavourful, lightly spiced gravy, garnished with fresh coriander. A comforting Navratri fasting special prepared with sendha namak and vrat-friendly spices, without onion or garlic.",
    introduction: "Classic tari-wale aloo in a rich, tangy tomato and cumin gravy cooked without onion or garlic, seasoned with sendha namak.",
    cuisine: "Vrat Special",
    prepTime: "10 mins",
    cookTime: "15 mins",
    totalTime: "25 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "3 Boiled Potatoes, lightly crushed by hand",
      "2 ripe Tomatoes, pureed",
      "1 tsp Cumin seeds",
      "1 tsp Grated Ginger",
      "1 tbsp Desi Ghee",
      "Sendha Namak to taste",
      "Fresh coriander leaves"
    ],
    instructions: [
      "Heat ghee in a pan, add cumin and ginger.",
      "Add tomato puree and cook till oil separates.",
      "Add hand-crushed potatoes, 1.5 cups water, and sendha namak.",
      "Simmer for 8-10 minutes until the gravy turns rich and luscious."
    ],
    tips: ["Crushing potatoes by hand rather than cutting gives the gravy naturally thick texture."],
    image: "https://b.zmtcdn.com/data/dish_photos/81b/45ea6feaaf1459c275a56d58477bc81b.jpeg",
    imageAlt: "Vrat Aloo Sabzi Gravy Foody Bhai",
    seoTitle: "Vrat Aloo Sabzi Gravy | Foody Bhai Meerut",
    seoDescription: "Comforting Vrat Aloo Sabzi Gravy for Navratri meals from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  },
  {
    title: "Kuttu Aloo Pakori (8-16 pcs)",
    slug: "kuttu-aloo-pakori-8-16-pcs",
    category: "Navratri Special",
    price: 89,
    description: "Enjoy crispy, golden potato pakoras coated in kuttu (buckwheat) flour batter and fried to perfection. A delicious Navratri fasting snack seasoned with sendha namak and served with refreshing green chutney. No onion or garlic.",
    introduction: "Crunchy tea-time vrat fritters made with sliced potatoes dipped in seasoned buckwheat batter, served with fresh fasting coriander-mint chutney.",
    cuisine: "Vrat Snacks",
    prepTime: "10 mins",
    cookTime: "10 mins",
    totalTime: "20 mins",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 cup Buckwheat (Kuttu) flour",
      "2 medium Potatoes, thinly sliced into rounds",
      "1 Green chilli, minced",
      "1/2 tsp Cumin seeds",
      "Sendha Namak to taste",
      "Oil or Ghee for deep frying"
    ],
    instructions: [
      "Whisk kuttu flour with water, rock salt, cumin, and minced chillies to make a thick coating batter.",
      "Dip potato slices into the batter and slide into hot oil.",
      "Deep fry on medium flame until crisp and deep golden-brown. Drain on paper towels and serve hot."
    ],
    tips: ["Ensure the batter is thick enough to coat the potato slices without dripping off."],
    image: "https://b.zmtcdn.com/data/dish_photos/7f8/5a94448ddbc2b6a62cf2cfe01aae97f8.jpeg",
    imageAlt: "Kuttu Aloo Pakori Navratri Snack Foody Bhai",
    seoTitle: "Kuttu Aloo Pakori | Foody Bhai Meerut",
    seoDescription: "Crispy Kuttu Aloo Pakori with sendha namak for Navratri from Foody Bhai Meerut.",
    isVeg: true,
    inStock: true
  }
];

async function insertItems() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  // 1. Ensure "Navratri Special" category exists in categories collection
  const catCol = mongoose.connection.collection('categories');
  const existingCat = await catCol.findOne({ name: 'Navratri Special' });
  if (!existingCat) {
    const catResult = await catCol.insertOne({
      name: 'Navratri Special',
      description: 'Authentic Vrat-friendly meals, fasting combos, kuttu delicacies and snacks from Foody Bhai.',
      icon: 'fa-solid fa-om',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted Navratri Special category:', catResult.insertedId);
  } else {
    console.log('Navratri Special category already exists');
  }

  // 2. Insert or update recipes
  const recipeCol = mongoose.connection.collection('recipes');
  
  // Find highest current numeric id
  const highest = await recipeCol.find({}).sort({ id: -1 }).limit(1).toArray();
  let nextId = (highest[0]?.id || 56) + 1;

  for (const dish of newDishes) {
    const existing = await recipeCol.findOne({
      $or: [
        { slug: dish.slug },
        { title: dish.title }
      ]
    });

    if (existing) {
      await recipeCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            ...dish,
            updatedAt: new Date()
          }
        }
      );
      console.log(`Updated existing dish: ${dish.title} (ID: ${existing.id})`);
    } else {
      const doc = {
        ...dish,
        id: nextId++,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };
      const res = await recipeCol.insertOne(doc);
      console.log(`Inserted new dish: ${dish.title} (ID: ${doc.id}, MongoID: ${res.insertedId})`);
    }
  }

  const total = await recipeCol.countDocuments();
  console.log(`\nOperation complete! Total recipes in DB now: ${total}`);

  // Also save clean JSON file for user reference
  fs.writeFileSync('navratri_and_macaroni_dishes.json', JSON.stringify(newDishes, null, 2));
  console.log('Saved navratri_and_macaroni_dishes.json');

  await mongoose.disconnect();
}

insertItems().catch(err => {
  console.error('Error inserting dishes:', err);
  process.exit(1);
});
