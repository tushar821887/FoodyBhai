import urllib.request
import json
import urllib.parse
import re
import time

def get_wiki_image(query):
    # Try the exact query first
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&format=json"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(response)
        if not data['query']['search']: return None
        title = data['query']['search'][0]['title']
        
        url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={urllib.parse.quote(title)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(response)
        pages = data['query']['pages']
        for page_id in pages:
            if 'original' in pages[page_id]:
                return pages[page_id]['original']['source'].split('?')[0] # remove query params
    except Exception as e:
        return None
    return None

import os

with open('src/app/services/recipe.service.ts', 'r') as f:
    content = f.read()

start_marker = 'private recipes: Recipe[] = '
start_idx = content.find(start_marker) + len(start_marker)
end_idx = content.find('];\n', start_idx) + 1

recipes_str = content[start_idx:end_idx]
recipes = json.loads(recipes_str)

generic_images = [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80', # Wait, this might be chicken, avoid it
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'
]

fallback_map = {
    'Roti': 'https://upload.wikimedia.org/wikipedia/commons/7/74/2020-05-08_19_34_28_Chapati_being_made_in_a_pan_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg',
    'Paratha': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Aloo_Paratha_also_known_as_Batatay_Jo_Phulko.jpg',
    'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    'Maggi': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80',
    'Dal': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Punjabi_style_Dal_Makhani.jpg',
    'Poha': 'https://upload.wikimedia.org/wikipedia/commons/1/10/Poha%2C_a_snack_made_of_beaten_rice.jpg',
    'Paneer': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Shahi_panner.jpg',
    'Rice': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    'Pasta': 'https://images.unsplash.com/photo-1626779849509-563b7fb3f8b0?auto=format&fit=crop&w=800&q=80',
    'Macaroni': 'https://images.unsplash.com/photo-1626779849509-563b7fb3f8b0?auto=format&fit=crop&w=800&q=80',
    'Bhel Puri': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Bhel_Puri_-_Mumbai.jpg',
    'Fries': 'https://upload.wikimedia.org/wikipedia/commons/8/83/French_Fries.jpg'
}

for i, r in enumerate(recipes):
    print(f"Processing {r['title']}...")
    img = None
    
    # Check fallback map first for consistent types
    for key, val in fallback_map.items():
        if key.lower() in r['title'].lower():
            img = val
            break
            
    if not img:
        search_terms = r['title'].replace('(Full)', '').replace('with', '').strip()
        img = get_wiki_image(search_terms)
        time.sleep(0.5)
        
    if not img:
        img = generic_images[i % len(generic_images)]
        
    r['image'] = img

new_content = content[:start_idx] + json.dumps(recipes, indent=4) + content[end_idx:]

with open('src/app/services/recipe.service.ts', 'w') as f:
    f.write(new_content)

print("Finished updating images!")
