import urllib.request
import json
import re

def get_image(query):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query + " food")
    req = urllib.request.Request(
        url, 
        data=None, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    )
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        print("Success fetching HTML")
        return html
    except Exception as e:
        print("Error:", e)
        return None

html = get_image("Aloo Paratha")
