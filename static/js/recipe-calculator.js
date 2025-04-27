const recipeImageInput = document.getElementById('recipeImage');
const processImageBtn = document.getElementById('processImageBtn');
const ingredientInputsContainer = document.getElementById('ingredientInputsContainer');
const addIngredientBtn = document.getElementById('addIngredientBtn');
const sendIngredientsBtn = document.getElementById('sendIngredientsBtn');
const walmartResultsContainer = document.getElementById('walmartResultsContainer');
const selectedItemsList = document.getElementById('selectedItemsList');
const totalPriceSpan = document.getElementById('totalPrice');

let selectedItems = [];
let totalCost = 0;

recipeImageInput.addEventListener('change', () => {
    if (recipeImageInput.files.length > 0) {
        processImageBtn.disabled = false;
    } else {
        processImageBtn.disabled = true;
    }
});

processImageBtn.addEventListener('click', async () => {
    const file = recipeImageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        const imageDataUrl = reader.result;

        const recognizeFoodEndpoint = '/recognize-ingredients';

        try {
            const requestBody = {
                image: imageDataUrl
            };

            const response = await fetch(recognizeFoodEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Backend Image Recognition Error:', error);
                alert(`Error processing image: ${error.error || 'Unknown error'}`);
                return;
            }

            const result = await response.json();
            const ingredientsText = result.foodName || '';

            if (ingredientsText === "No ingredients detected.") {
                displayIngredients("");
                alert("No ingredients detected in the image.");
            } else {
                displayIngredients(ingredientsText);
            }


        } catch (error) {
            console.error('Error calling backend image recognition API:', error);
            alert('An error occurred while sending the image to the backend.');
        }
    };
    reader.readAsDataURL(file);
});

function displayIngredients(ingredientsString) {
    ingredientInputsContainer.innerHTML = '<h2>Ingredients</h2>';

    const ingredients = ingredientsString.split(',').map(item => item.trim()).filter(item => item !== '');

    ingredients.forEach(ingredient => {
        addIngredientInput(ingredient);
    });

    if (ingredients.length === 0) {
        addIngredientInput('');
    }

    updateSendButtonState();
}

function addIngredientInput(value = '') {
    const inputGroup = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Enter ingredient';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        inputGroup.remove();
        updateSendButtonState();
    });

    input.addEventListener('input', updateSendButtonState); 

    inputGroup.appendChild(input);
    inputGroup.appendChild(deleteBtn);
    ingredientInputsContainer.appendChild(inputGroup);

    updateSendButtonState();
}

addIngredientBtn.addEventListener('click', () => {
    addIngredientInput();
});

function updateSendButtonState() {
    const inputs = ingredientInputsContainer.querySelectorAll('input[type="text"]');
    let hasNonEmpty = false;
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            hasNonEmpty = true;
        }
    });
    sendIngredientsBtn.disabled = !hasNonEmpty;
}

sendIngredientsBtn.addEventListener('click', async () => {
    const inputs = ingredientInputsContainer.querySelectorAll('input[type="text"]');
    const ingredients = [];
    inputs.forEach(input => {
        const trimmedValue = input.value.trim();
        if (trimmedValue !== '') {
            ingredients.push(trimmedValue);
        }
    });

    if (ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }

    const backendApiEndpoint = '/walmart';

    try {
        const response = await fetch(backendApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: ingredients })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Backend API Error:', error);
            alert('Error fetching Walmart items. Check console for details.');
            return;
        }

        const walmartResults = await response.json();

        displayWalmartResults(walmartResults);

    } catch (error) {
        console.error('Error calling backend API:', error);
        alert('An error occurred while calling the backend API.');
    }
});


function displayWalmartResults(results) {
    walmartResultsContainer.innerHTML = '<h2>Walmart Items</h2>';

    if (!results || results.length === 0) {
        walmartResultsContainer.innerHTML += '<p>No Walmart items found for these ingredients.</p>';
        return;
    }
    console.log("RESULT: " + results)

    Object.keys(results).forEach((ingredientKey, index) => {
        const ingredientName = ingredientInputsContainer.querySelectorAll('input[type="text"]')[index]?.value || `Ingredient ${index + 1}`;
        const ingredientSection = document.createElement('div');
        ingredientSection.innerHTML = `<h3>Items for: ${ingredientName}</h3>`;

        results[ingredientKey].forEach((ingredientItems, index) => {
            const itemCard = document.createElement('div');
            itemCard.style.border = '1px solid black';
            itemCard.style.margin = '10px';
            itemCard.style.padding = '10px';
            const itemName = document.createElement('h4');
            itemName.textContent = ingredientItems.name;

            const itemPrice = document.createElement('p');
            itemPrice.textContent = `Price: $${ingredientItems.price.toFixed(2)}`;

            const itemDescription = document.createElement('p');
            itemDescription.innerHTML = `<a href="${ingredientItems.description}">Link</a>`;

            const addButton = document.createElement('button');
            addButton.textContent = 'Add to List';
            addButton.addEventListener('click', () => {
                addItemToSelected(ingredientItems);
            });

            itemCard.appendChild(itemName);
            itemCard.appendChild(itemPrice);
            itemCard.appendChild(itemDescription);
            itemCard.appendChild(addButton);

            ingredientSection.appendChild(itemCard);
        })
        walmartResultsContainer.appendChild(ingredientSection);
    })
}

function addItemToSelected(item) {
    const itemId = item.id || `${item.name.replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} - $${item.price.toFixed(2)}`;
    listItem.dataset.itemId = itemId;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', () => {
        removeItemFromSelected(itemId, item.price);
        listItem.remove();
    });

    listItem.appendChild(deleteBtn);
    selectedItemsList.appendChild(listItem);

    selectedItems.push({ ...item, id: itemId });

    totalCost += item.price;
    totalPriceSpan.textContent = totalCost.toFixed(2);
}

function removeItemFromSelected(itemId, itemPrice) {
    selectedItems = selectedItems.filter(item => item.id !== itemId);

    totalCost -= itemPrice;
    if (totalCost < 0) totalCost = 0;
    totalPriceSpan.textContent = totalCost.toFixed(2);
}

updateSendButtonState();