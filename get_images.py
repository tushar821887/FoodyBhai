import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://api.unsplash.com/search/photos?query=indian+food&per_page=30&client_id=YxJq_1w3v298Gk9O5g5xYV5u7wT7V8_v4Z0kO8H3tZ8', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode())
        for item in data['results']:
            print(item['urls']['regular'])
except Exception as e:
    print(e)
