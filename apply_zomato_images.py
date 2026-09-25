import json, re

# Zomato image mapping extracted from the outlet page
# format: item_name => zomato_image_url (high-res version without crop params)
zomato_images = {
    "South Indian Poha (Full)": "https://b.zmtcdn.com/data/dish_photos/c28/d1b40e1aa8609b995caf2e3f11ba6c28.jpeg",
    "Paneer Butter Masala": "https://b.zmtcdn.com/data/dish_photos/ba7/af5a2bd5e1a6587c9981ea0beadc4ba7.jpeg",
    "Dal Tadka": "https://b.zmtcdn.com/data/dish_photos/bc6/e777b20df7aad899b9f750203b49dbc6.jpeg",
    "Dal Fry": "https://b.zmtcdn.com/data/dish_photos/e5f/b2849d858dedd53dbfea3a377ac7be5f.jpg",
    "Aloo Jeera Masala": "https://b.zmtcdn.com/data/dish_photos/c75/f3df03ef4ac0fcc1433dd08a4e60fc75.jpg",
    "Paneer Do Pyaaza": "https://b.zmtcdn.com/data/dish_photos/1ca/6eab6398e4ec2a0594910f77b0cf51ca.jpg",
    "Paneer Lababdar": "https://b.zmtcdn.com/data/dish_photos/18e/89d82153a01471a13451c7a44e85118e.jpg",
    "Peri Peri Fries": "https://b.zmtcdn.com/data/dish_photos/84a/4e95df262694e22d62e5712895bb184a.jpeg",
    "Matar Paneer": "https://b.zmtcdn.com/data/dish_photos/eb7/875cdd2028a0a80dd7826e32be1c3eb7.jpeg",
    "Aloo Sabzi with Gravy": "https://b.zmtcdn.com/data/dish_photos/079/6680db214f10f47d7a68c9bd247bd079.jpg",
    "4 Puri + Aloo Sabzi": "https://b.zmtcdn.com/data/dish_photos/f6d/b46b6b03af99bc15deb96f4f24fdff6d.jpeg",
    "6 Puri + Aloo Sabzi": "https://b.zmtcdn.com/data/dish_photos/da1/c6655bd826cf05a4267d377b27c41da1.jpeg",
    "6 Puri + Sabzi + Raita": "https://b.zmtcdn.com/data/dish_photos/4fe/a98e23e8a6deff06f7bc0661f85ec4fe.jpeg",
    "4 Special Puri + Sabzi": "https://b.zmtcdn.com/data/dish_photos/ded/ea86fccbddd7e4ed927ade555de1cded.jpeg",
    "Steam Rice": "https://b.zmtcdn.com/data/dish_photos/139/f85b75996f17e3e9ae90d0cd420a8139.png",
    "Jeera Rice": "https://b.zmtcdn.com/data/dish_photos/367/2b1a15c33fcb7d6a1c91f9bff6677367.jpg",
    "Fried Rice": "https://b.zmtcdn.com/data/dish_photos/81e/ebe8803c2625d73ffaffdd4710f1681e.png",
    "Tawa Roti with Butter": "https://b.zmtcdn.com/data/dish_photos/b86/2526b751471618ed226f11f400217b86.jpeg",
    "Tawa Roti Ghee Wali": "https://b.zmtcdn.com/data/dish_photos/b69/f232b02d1e2d1535cbf6d7b8301b2b69.jpg",
    "Tawa Roti": "https://b.zmtcdn.com/data/dish_photos/494/409a3a96f6198c79d3797ed7e0069494.png",
    "Plain Butter Paratha": "https://b.zmtcdn.com/data/dish_photos/630/d3a8ef27386d796a52bc80fe6eeb6630.jpg",
    "Plain Paneer Paratha": "https://b.zmtcdn.com/data/dish_photos/49e/d1531de51830665b134ce5e20f55949e.jpg",
    "Paneer Paratha with Butter": "https://b.zmtcdn.com/data/dish_photos/2b0/7e4f51ba13d2411841a1719e6c8c72b0.jpg",
    "Aloo Paratha": "https://b.zmtcdn.com/data/dish_photos/4dd/b3af00f71f5cb231f4b812c7353964dd.jpeg",
    "Aloo Pyaaz Paratha": "https://b.zmtcdn.com/data/dish_photos/4dd/65bf3b264f46f0a391f47e6f72e584dd.jpg",
    "Gobi Paratha": "https://b.zmtcdn.com/data/dish_photos/6a0/ac194a6cb90fc69d8f47b9c7c1c1b6a0.jpg",
    "Mixed Veggie Paratha": "https://b.zmtcdn.com/data/dish_photos/e13/4e14bd2b8e45869fd16151ebc5136e13.jpg",
    "Aloo Paneer Pyaaz Paratha": "https://b.zmtcdn.com/data/dish_photos/542/245d02bb3283e67314a10905e9f83542.jpeg",
    "Royal Aloo Pyaaz Paratha": "https://b.zmtcdn.com/data/dish_photos/528/9a9d7bf37e8641ba304d4871c1663528.jpg",
    "Red Sauce Pasta": "https://b.zmtcdn.com/data/dish_photos/fb9/d86236665754991867498eb4fdf2afb9.jpg",
    "Masala Macaroni": "https://b.zmtcdn.com/data/dish_photos/7b6/52b9c30359a4f66d1dcea88849a8d7b6.jpg",
    "Bhel Puri North Indian Style (Full)": "https://b.zmtcdn.com/data/dish_photos/313/22ea32b1d83b742fb4d8e91a2b5fb313.jpg",
    "Plain Maggi": "https://b.zmtcdn.com/data/dish_photos/65b/50321763a2bd9b10360105a045aa565b.png",
    "Mix Veggie Maggi": "https://b.zmtcdn.com/data/dish_photos/a8e/9aa13209ad31ee382449c8a2902d7a8e.jpg",
    "Mix Veg Maggie with Butter": "https://b.zmtcdn.com/data/dish_photos/a4a/b6d6254d66744ec2a117732a52a09a4a.jpg",
    "Peri Peri Maggi": "https://b.zmtcdn.com/data/dish_photos/49d/aa15b854453ff6e9de7671981633e49d.jpg",
    "Fresh Kheera, Tomato & Onion Salad": "https://b.zmtcdn.com/data/dish_photos/7f6/a5120f06f9a941e2579d1d632d5047f6.jpeg",
    "Kheera Salad": "https://b.zmtcdn.com/data/dish_photos/f88/d53227dd915a9fd05f157091f267ef88.jpeg",
    "Onion Salad": "https://b.zmtcdn.com/data/dish_photos/edf/900d2b4d20761f27a1391634d792eedf.jpeg",
    "Tomato Salad": "https://b.zmtcdn.com/data/dish_photos/525/b8a74d30f3de9ffd504eee9a7493a525.jpeg",
    "Boondi Raita": "https://b.zmtcdn.com/data/dish_photos/b5f/bce0832a5e8ed27a46ffe9bb8f716b5f.png",
    "Mix Veg Raita": "https://b.zmtcdn.com/data/dish_photos/4d7/603dd35d1ee3d715a4917cc2c81424d7.png",
    "Plain Raita": "https://b.zmtcdn.com/data/dish_photos/775/21aa04db95d3e6137e4dcfa704d47775.png",
    "Masala Shikanji": "https://b.zmtcdn.com/data/dish_photos/a47/93ca564612cfa241bc2e8ddc72db1a47.jpeg",
    "Dal Chawal Combo": "https://b.zmtcdn.com/data/dish_photos/e3c/87fa4cf53ba6eb8efc28fd7581868e3c.jpeg",
    "Dal with 4 Roti": "https://b.zmtcdn.com/data/dish_photos/a95/57f72046ee6767b8d2973f093b0fda95.jpeg",
    "Dal with Chawal and 4 Roti": "https://b.zmtcdn.com/data/dish_photos/092/428c3cd80b4d6e4e166014332de1b092.jpeg",
    "Paneer Butter Masala with 4 Roti": "https://b.zmtcdn.com/data/dish_photos/605/c556a7487ca4680a960464f2943bc605.jpg",
    "Aloo Jeera Masala With Raita and 4 Roti": "https://b.zmtcdn.com/data/dish_photos/e03/88e4577157e2d424c363e55e2d8f7e03.jpg",
    "Red Sauce Pasta + Macroni": "https://b.zmtcdn.com/data/dish_photos/3e6/7285238fdd8e70920b4fed76346743e6.jpg",
    "Paneer Masala + 4 Roti + Salad": "https://b.zmtcdn.com/data/dish_photos/15d/9efe37a00f9f3cc5c9add21a2c7e315d.jpg",
    "Dal + 4 Roti + Jeera Aloo + Salad": "https://b.zmtcdn.com/data/dish_photos/abe/8ff705e448f6e47d260ad1c9607bdabe.jpg",
    "Dal + Chawal + Salad": "https://b.zmtcdn.com/data/dish_photos/343/23a8f00660e5c5acc9047404cb3fb343.jpeg",
}

with open('src/app/services/recipe.service.ts', 'r') as f:
    content = f.read()

start_marker = 'private recipes: Recipe[] = '
start_idx = content.find(start_marker) + len(start_marker)
end_idx = content.find('];\n', start_idx) + 1

recipes = json.loads(content[start_idx:end_idx])

updated = 0
missing = []

for r in recipes:
    title = r['title']
    if title in zomato_images:
        r['image'] = zomato_images[title]
        updated += 1
    else:
        # Try case-insensitive match
        found = False
        for zname, zimg in zomato_images.items():
            if zname.lower() == title.lower():
                r['image'] = zimg
                updated += 1
                found = True
                break
        if not found:
            missing.append(title)

new_content = content[:start_idx] + json.dumps(recipes, indent=4) + content[end_idx:]

with open('src/app/services/recipe.service.ts', 'w') as f:
    f.write(new_content)

print(f"Updated {updated} items with Zomato images")
if missing:
    print(f"Missing items (no exact match): {missing}")
print("Done!")
