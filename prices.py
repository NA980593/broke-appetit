import requests

SERPAPI_KEY = "e0e9e9e2c0faa3064ba3b2689370fc6250b7ae1216188d3571af88e7b06bea7f"  # Replace with your real key

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
        for item in data["organic_results"][:5]:  # Get top 5 results
            title = item.get("title", "No Title")
            price = item.get("primary_offer", {}).get("offer_price", "No Price")
            link = item.get("link", "#")
            products.append({
                "title": title,
                "price": price,
                "link": link
            })
    return products

def search_target(product_name):
    params = {
        "engine": "target",
        "query": product_name,
        "api_key": SERPAPI_KEY
    }
    response = requests.get("https://serpapi.com/search", params=params)
    data = response.json()

    products = []
    if "shopping_results" in data:
        for item in data["shopping_results"][:5]:  # Top 5 results
            title = item.get("title", "No Title")
            price = item.get("price", "No Price")
            link = item.get("link", "#")
            products.append({
                "title": title,
                "price": price,
                "link": link
            })
    return products

if __name__ == "__main__":
    product = input("Enter a product to search: ")

    walmart_results = search_walmart(product)
    print("\nWalmart Results:")
    for result in walmart_results:
        print(result)

    target_results = search_target(product)
    print("\nTarget Results:")
    for result in target_results:
        print(result)
