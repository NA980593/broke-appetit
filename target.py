def search_target(product_name):
    """Search Target for product prices using Unwrangle"""
    unwrangle_api_key = "232624b6254c188cb06f865a370a3bbd2eb1b4f8"
    url = "https://api.unwrangle.com/v1/target/search"
    params = {
        "query": product_name,
        "country": "us"
    }
    headers = {
        "Authorization": f"Bearer {unwrangle_api_key}"
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    products = []
    if "data" in data:
        for item in data["data"][:5]:  # limit to 5 results
            title = item.get("title", "Unknown Item")
            price = item.get("price", {}).get("price", "Unknown Price")
            link = item.get("url", "#")
            products.append({
                "store": "Target",
                "title": title,
                "price": f"${price}",
                "link": link
            })

    return products
# walmart_prices = search_prices(product_guess)
# target_prices = search_target(product_guess)

# combine the two
# prices = walmart_prices + target_prices

# return render_template('results.html', product=product_guess, prices=prices)