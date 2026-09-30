import urllib.request
import json
import urllib.parse

def get_wiki_image(query):
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&format=json"
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
            return pages[page_id]['original']['source']
    return None

print(get_wiki_image("Paneer Butter Masala"))
print(get_wiki_image("Dal Makhani"))
print(get_wiki_image("Aloo Sabzi"))
