import requests

# SERPAPI_KEY = os.environ.get("SERPAPI") # Get API key from environment variable


def search_walmart(product_name):
    params = {
        "engine": "walmart",
        "query": product_name,
        "api_key": SERPAPI_KEY
    }
    response = requests.get("https://serpapi.com/search", params=params)
    data = response.json()

    products = []
    if "organic_results" in data:
        x=0
        for item in data["organic_results"][:8]:  # top 8 results
            title = item.get("title", "No Title")
            price = item.get("primary_offer", {}).get("offer_price", "No Price")
            link = item.get("product_page_url", "#")
            products.append({
                "id":x,
                "name": title,
                "price": price,
                "description": link
            })
            x+=1
    print(products)
    return products

