// State management
let selectedMood = null;
let currentRecipe = null;

// DOM elements
const moodCards = document.querySelectorAll('.mood-card');
const getRecipeBtn = document.getElementById('get-recipe-btn');
const newRecipeBtn = document.getElementById('new-recipe-btn');
const changeMoodBtn = document.getElementById('change-mood-btn');
const moodSelection = document.getElementById('mood-selection');
const recipeContainer = document.getElementById('recipe-container');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');
const userEmailEl = document.getElementById('user-email');
const adminBtn = document.getElementById('admin-btn');

// Check authentication on page load
checkAuth();

async function checkAuth() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/login';
        } else {
            userEmailEl.textContent = `Welcome, ${data.email}!`;
            
            // Show admin button if user is admin
            if (data.isAdmin) {
                adminBtn.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
    }
}

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/logout', {
            method: 'POST',
        });
        
        if (response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Mood selection handler
moodCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove selected class from all cards
        moodCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Update selected mood
        selectedMood = card.dataset.mood;
        
        // Enable get recipe button
        getRecipeBtn.disabled = false;
    });
});

// Get recipe button handler
getRecipeBtn.addEventListener('click', () => {
    if (selectedMood) {
        fetchRecipe(selectedMood);
    }
});

// New recipe button handler
newRecipeBtn.addEventListener('click', () => {
    if (selectedMood) {
        fetchRecipe(selectedMood);
    }
});

// Change mood button handler
changeMoodBtn.addEventListener('click', () => {
    // Reset UI
    recipeContainer.classList.add('hidden');
    moodSelection.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Fetch recipe from API
async function fetchRecipe(mood) {
    try {
        // Hide error and recipe
        errorMessage.classList.add('hidden');
        recipeContainer.classList.add('hidden');
        
        // Show loading
        loading.classList.remove('hidden');
        
        // Fetch recipe
        const response = await fetch(`http://localhost:3000/api/recipes/${mood}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recipe');
        }
        
        const recipe = await response.json();
        currentRecipe = recipe;
        
        // Display recipe
        displayRecipe(recipe);
        
        // Hide loading and mood selection
        loading.classList.add('hidden');
        moodSelection.classList.add('hidden');
        
        // Show recipe
        recipeContainer.classList.remove('hidden');
        
        // Scroll to recipe
        recipeContainer.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error fetching recipe:', error);
        loading.classList.add('hidden');
        showError('Failed to fetch recipe. Please try again.');
    }
}

// Display recipe in the UI
function displayRecipe(recipe) {
    // Set recipe name and image
    document.getElementById('recipe-name').textContent = recipe.name;
    document.getElementById('recipe-image').textContent = recipe.image || '🍽️';
    document.getElementById('recipe-time').innerHTML = `⏱️ ${recipe.prepTime}`;
    document.getElementById('recipe-servings').innerHTML = `👥 ${recipe.servings} servings`;
    
    // Display ingredients
    const ingredientsList = document.getElementById('recipe-ingredients');
    ingredientsList.innerHTML = '';
    const ingredients = recipe.ingredients.split(',').map(i => i.trim());
    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.innerHTML = `<span class="text-purple-500">•</span> ${ingredient}`;
        ingredientsList.appendChild(li);
    });
    
    // Display instructions
    const instructionsList = document.getElementById('recipe-instructions');
    instructionsList.innerHTML = '';
    
    // Split instructions by numbered steps
    const instructions = recipe.instructions.split(/\d+\./).filter(s => s.trim());
    instructions.forEach((instruction, index) => {
        const li = document.createElement('li');
        li.className = 'text-gray-700 mb-2';
        li.textContent = instruction.trim();
        instructionsList.appendChild(li);
    });
}

// Show error message
function showError(message) {
    document.getElementById('error-text').textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Welcome animation
window.addEventListener('load', () => {
    document.querySelector('header').style.animation = 'fadeIn 0.8s ease';
});

