def search_prices(product_name):
    """Search Walmart for real product prices using SerpApi"""
    serpapi_api_key = "e0e9e9e2c0faa3064ba3b2689370fc6250b7ae1216188d3571af88e7b06bea7f"
    url = "https://serpapi.com/search"
    params = {
        "engine": "walmart",
        "query": product_name,
        "api_key": serpapi_api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    # Parse results
    products = []
    if "organic_results" in data:
        for item in data["organic_results"][:5]:  # limit to 5 results
            title = item.get("title", "Unknown Item")
            price = item.get("primary_offer", {}).get("offer_price", "Unknown Price")
            link = item.get("link", "#")
            products.append({
                "store": "Walmart",
                "title": title,
                "price": f"${price}",
                "link": link
            })

    return products
