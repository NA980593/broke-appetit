const webcamVideo = document.getElementById('webcamVideo');
const captureButton = document.getElementById('captureButton');
const capturedCanvas = document.getElementById('capturedCanvas');
const foodInput = document.getElementById('foodInput');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');
const context = capturedCanvas.getContext('2d');
const statusText = document.getElementById('statusText');

function updateStatus(message) {
    statusText.textContent = message;
}

updateStatus("Accessing webcam...");

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        webcamVideo.srcObject = stream;
        updateStatus("Webcam ready. Capture an image or enter food name.");
    })
    .catch(err => {
        console.error("Error accessing webcam: ", err);
        updateStatus("Error: Could not access webcam.");
        alert("Could not access webcam. Please ensure you have a webcam and have granted permission.");
    });

captureButton.addEventListener('click', async () => {
    updateStatus("Capturing image...");
    context.drawImage(webcamVideo, 0, 0, capturedCanvas.width, capturedCanvas.height);

    const imageDataUrl = capturedCanvas.toDataURL('image/jpeg', 0.9);

    updateStatus("Recognizing food...");

    try {
        const foodName = await sendImageToFlask(imageDataUrl);

        foodInput.value = foodName;
        updateStatus(`Recognized: ${foodName}. Find prices or modify.`);
        checkInputAndEnableButton();

    } catch (error) {
        console.error("Simulated Gemini API error:", error);
        foodInput.value = "Could not recognize food";
        updateStatus("Error: Could not recognize food.");
        checkInputAndEnableButton();
    }

});

foodInput.addEventListener('input', checkInputAndEnableButton);

function checkInputAndEnableButton() {
    searchButton.disabled = foodInput.value.trim() === '';
    if (!searchButton.disabled && statusText.textContent.includes("Webcam ready") || statusText.textContent.includes("Error: Could not recognize food")) {
        updateStatus("Enter food name or use webcam.");
    } else if (searchButton.disabled && !statusText.textContent.includes("Webcam ready") && !statusText.textContent.includes("Error: Could not recognize food")) {
        updateStatus("Enter food name or use webcam.");
    }
}

searchButton.addEventListener('click', () => {
    const foodItem = foodInput.value.trim();
    if (foodItem === '') {
        alert("Please enter a food item.");
        updateStatus("Please enter a food item.");
        return;
    }

    resultsDiv.innerHTML = '';
    updateStatus(`Searching for prices for "${foodItem}"...`);

    simulateStorePrices(foodItem)
        .then(prices => {
            displayPrices(prices);
            updateStatus(`Prices found for "${foodItem}".`);
        })
        .catch(error => {
            console.error("Simulated store API error:", error);
            resultsDiv.innerHTML = '<p>Could not fetch prices.</p>';
            updateStatus("Error: Could not fetch prices.");
        });
});

function simulateStorePrices(item) {
    console.log(`Simulating price search for: ${item}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const simulatedPrices = [
                { store: 'Walmart', price: (Math.random() * 5 + 1).toFixed(2), link: `https://www.walmart.com/search?q=${encodeURIComponent(item)}` },
                { store: 'Target', price: (Math.random() * 6 + 1.5).toFixed(2), link: `https://www.target.com/s?searchTerm=${encodeURIComponent(item)}` },
                { store: 'Whole Foods', price: (Math.random() * 8 + 2).toFixed(2), link: `https://www.wholefoodsmarket.com/search?text=${encodeURIComponent(item)}` }
            ];

            simulatedPrices.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

            console.log("Simulated prices:", simulatedPrices);
            resolve(simulatedPrices);
        }, 2000);
    });
}

function displayPrices(prices) {
    if (prices.length === 0) {
        resultsDiv.innerHTML = '<p>No prices found.</p>';
        return;
    }

    const list = document.createElement('ul');

    prices.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
                    <strong>${item.store}:</strong> $${item.price} - <a href="${item.link}" target="_blank">View on ${item.store}</a>
                `;
        list.appendChild(listItem);
    });

    resultsDiv.appendChild(list);
}

async function sendImageToFlask(imageDataUrl) {
    const response = await fetch('/recognize-food', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageDataUrl })
    });
    const data = await response.json();
    if (response.ok) {
        return data.foodName;
    } else {
        throw new Error(data.error || 'Recognition failed');
    }
}

async function getPricesFromFlask(foodItem) {
    const response = await fetch('/get-prices', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ item: foodItem })
   });
   const data = await response.json();
    if (response.ok) {
       return data.prices;
   } else {
       throw new Error(data.error || 'Price fetch failed');
   }
}