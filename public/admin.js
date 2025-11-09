// DOM elements
const recipesTab = document.getElementById('recipes-tab');
const usersTab = document.getElementById('users-tab');
const recipesSection = document.getElementById('recipes-section');
const usersSection = document.getElementById('users-section');
const logoutBtn = document.getElementById('logout-btn');

const recipesLoading = document.getElementById('recipes-loading');
const recipesContent = document.getElementById('recipes-content');
const recipesTableBody = document.getElementById('recipes-table-body');
const totalRecipesEl = document.getElementById('total-recipes');

const usersLoading = document.getElementById('users-loading');
const usersContent = document.getElementById('users-content');
const usersTableBody = document.getElementById('users-table-body');
const totalUsersEl = document.getElementById('total-users');

const addUserForm = document.getElementById('add-user-form');
const newUserEmail = document.getElementById('new-user-email');
const newUserPassword = document.getElementById('new-user-password');
const newUserAdmin = document.getElementById('new-user-admin');
const addUserBtn = document.getElementById('add-user-btn');
const addUserBtnText = document.getElementById('add-user-btn-text');
const addUserBtnLoading = document.getElementById('add-user-btn-loading');

const userError = document.getElementById('user-error');
const userErrorText = document.getElementById('user-error-text');
const userSuccess = document.getElementById('user-success');
const userSuccessText = document.getElementById('user-success-text');

// Recipe modal elements
const recipeModal = document.getElementById('recipe-modal');
const recipeModalTitle = document.getElementById('recipe-modal-title');
const closeRecipeModal = document.getElementById('close-recipe-modal');
const createRecipeBtn = document.getElementById('create-recipe-btn');
const recipeForm = document.getElementById('recipe-form');
const recipeId = document.getElementById('recipe-id');
const recipeName = document.getElementById('recipe-name');
const recipeMood = document.getElementById('recipe-mood');
const recipePrepTime = document.getElementById('recipe-preptime');
const recipeServings = document.getElementById('recipe-servings');
const recipeImage = document.getElementById('recipe-image');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeInstructions = document.getElementById('recipe-instructions');
const cancelRecipeBtn = document.getElementById('cancel-recipe-btn');
const saveRecipeBtn = document.getElementById('save-recipe-btn');
const saveRecipeText = document.getElementById('save-recipe-text');
const saveRecipeLoading = document.getElementById('save-recipe-loading');
const recipeError = document.getElementById('recipe-error');
const recipeErrorText = document.getElementById('recipe-error-text');


// Check if user is admin
checkAdminAccess();

async function checkAdminAccess() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/status');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/login';
        } else if (!data.isAdmin) {
            window.location.href = '/';
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

// Tab switching
recipesTab.addEventListener('click', () => {
    recipesTab.classList.remove('tab-inactive');
    recipesTab.classList.add('tab-active');
    usersTab.classList.remove('tab-active');
    usersTab.classList.add('tab-inactive');
    
    recipesSection.classList.remove('hidden');
    usersSection.classList.add('hidden');
    recipesSection.classList.add('fade-in');
});

usersTab.addEventListener('click', () => {
    usersTab.classList.remove('tab-inactive');
    usersTab.classList.add('tab-active');
    recipesTab.classList.remove('tab-active');
    recipesTab.classList.add('tab-inactive');
    
    usersSection.classList.remove('hidden');
    recipesSection.classList.add('hidden');
    usersSection.classList.add('fade-in');
    
    // Load users if not already loaded
    if (usersTableBody.children.length === 0) {
        loadUsers();
    }
});

// Recipe modal handlers
createRecipeBtn.addEventListener('click', () => {
    openRecipeModal();
});

closeRecipeModal.addEventListener('click', () => {
    closeModal();
});

cancelRecipeBtn.addEventListener('click', () => {
    closeModal();
});

// Close modal when clicking outside
recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        closeModal();
    }
});

// Recipe form submission
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveRecipe();
});


// Load recipes on page load
loadRecipes();

async function loadRecipes() {
    try {
        recipesLoading.classList.remove('hidden');
        recipesContent.classList.add('hidden');
        
        const response = await fetch('http://localhost:3000/api/admin/recipes');
        
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        
        const recipes = await response.json();
        
        // Clear table
        recipesTableBody.innerHTML = '';
        
        // Group recipes by mood for alternating colors
        let currentMood = '';
        let isEvenMood = false;
        
        recipes.forEach(recipe => {
            if (recipe.mood !== currentMood) {
                currentMood = recipe.mood;
                isEvenMood = !isEvenMood;
            }
            
            const row = document.createElement('tr');
            const isActive = recipe.active === 1;
            row.className = `${isEvenMood ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'} ${!isActive ? 'opacity-60' : ''}`;
            row.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-700">${recipe.id}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                    ${recipe.image || '🍽️'} ${recipe.name}
                    ${!isActive ? '<span class="ml-2 text-xs text-gray-500 italic">(Inactive)</span>' : ''}
                </td>
                <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getMoodColor(recipe.mood)}">
                        ${recipe.mood}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${recipe.prepTime}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${recipe.servings}</td>
                <td class="px-4 py-3 text-sm text-center">
                    <label class="inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            ${isActive ? 'checked' : ''} 
                            onchange="toggleRecipeActive(${recipe.id}, this)"
                            class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                        />
                    </label>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                    <button onclick="editRecipe(${recipe.id})" class="text-blue-600 hover:text-blue-800 font-medium">
                        ✏️ Edit
                    </button>
                </td>
            `;
            recipesTableBody.appendChild(row);
        });
        
        totalRecipesEl.textContent = recipes.length;
        
        recipesLoading.classList.add('hidden');
        recipesContent.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipesLoading.innerHTML = '<p class="text-red-600">Error loading recipes. Please refresh.</p>';
    }
}

async function loadUsers() {
    try {
        usersLoading.classList.remove('hidden');
        usersContent.classList.add('hidden');
        
        const response = await fetch('http://localhost:3000/api/admin/users');
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        
        // Clear table
        usersTableBody.innerHTML = '';
        
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-700">${user.id}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${user.email}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }">
                        ${user.isAdmin ? '👑 Admin' : '👤 User'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${formatDate(user.created_at)}</td>
            `;
            usersTableBody.appendChild(row);
        });
        
        totalUsersEl.textContent = users.length;
        
        usersLoading.classList.add('hidden');
        usersContent.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading users:', error);
        usersLoading.innerHTML = '<p class="text-red-600">Error loading users. Please refresh.</p>';
    }
}

// Add user form handler
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = newUserEmail.value.trim();
    const password = newUserPassword.value;
    const isAdmin = newUserAdmin.checked;
    
    if (!email || !password) {
        showUserError('Please enter both email and password');
        return;
    }
    
    setAddUserLoading(true);
    hideUserMessages();
    
    try {
        const response = await fetch('http://localhost:3000/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, isAdmin }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showUserSuccess(`User ${email} created successfully!`);
            addUserForm.reset();
            // Reload users list
            loadUsers();
        } else {
            showUserError(data.error || 'Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showUserError('Connection error. Please try again.');
    } finally {
        setAddUserLoading(false);
    }
});

// Recipe CRUD functions
function openRecipeModal(recipe = null) {
    if (recipe) {
        // Edit mode
        recipeModalTitle.textContent = 'Edit Recipe';
        recipeId.value = recipe.id;
        recipeName.value = recipe.name;
        recipeMood.value = recipe.mood;
        recipePrepTime.value = recipe.prepTime;
        recipeServings.value = recipe.servings;
        recipeImage.value = recipe.image || '';
        recipeIngredients.value = recipe.ingredients;
        recipeInstructions.value = recipe.instructions;
        saveRecipeText.textContent = 'Update Recipe';
    } else {
        // Create mode
        recipeModalTitle.textContent = 'Create New Recipe';
        recipeForm.reset();
        recipeId.value = '';
        saveRecipeText.textContent = 'Save Recipe';
    }
    
    hideRecipeError();
    recipeModal.classList.remove('hidden');
}

function closeModal() {
    recipeModal.classList.add('hidden');
    recipeForm.reset();
    hideRecipeError();
}

async function editRecipe(id) {
    try {
        // Fetch the recipe details
        const response = await fetch('http://localhost:3000/api/admin/recipes');
        const recipes = await response.json();
        const recipe = recipes.find(r => r.id === id);
        
        if (recipe) {
            openRecipeModal(recipe);
        }
    } catch (error) {
        console.error('Error fetching recipe:', error);
    }
}

async function toggleRecipeActive(id, checkbox) {
    const originalState = checkbox.checked;
    
    try {
        const response = await fetch(`http://localhost:3000/api/admin/recipes/${id}/toggle`, {
            method: 'PATCH',
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Reload recipes to reflect the change
            loadRecipes();
        } else {
            // Revert checkbox if failed
            checkbox.checked = !originalState;
            alert('Failed to update recipe status: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error toggling recipe status:', error);
        // Revert checkbox if failed
        checkbox.checked = !originalState;
        alert('Connection error. Please try again.');
    }
}

async function saveRecipe() {
    const id = recipeId.value;
    const data = {
        name: recipeName.value.trim(),
        mood: recipeMood.value,
        ingredients: recipeIngredients.value.trim(),
        instructions: recipeInstructions.value.trim(),
        prepTime: recipePrepTime.value.trim(),
        servings: parseInt(recipeServings.value),
        image: recipeImage.value.trim() || '🍽️',
    };

    if (!data.name || !data.mood || !data.ingredients || !data.instructions || !data.prepTime || !data.servings) {
        showRecipeError('Please fill in all required fields');
        return;
    }

    setSaveLoading(true);
    hideRecipeError();

    try {
        const url = id 
            ? `http://localhost:3000/api/admin/recipes/${id}`
            : 'http://localhost:3000/api/admin/recipes';
        
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            closeModal();
            loadRecipes(); // Reload the recipes list
        } else {
            showRecipeError(result.error || 'Failed to save recipe');
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        showRecipeError('Connection error. Please try again.');
    } finally {
        setSaveLoading(false);
    }
}

function setSaveLoading(loading) {
    saveRecipeBtn.disabled = loading;
    if (loading) {
        saveRecipeText.classList.add('hidden');
        saveRecipeLoading.classList.remove('hidden');
    } else {
        saveRecipeText.classList.remove('hidden');
        saveRecipeLoading.classList.add('hidden');
    }
}

function showRecipeError(message) {
    recipeErrorText.textContent = message;
    recipeError.classList.remove('hidden');
}

function hideRecipeError() {
    recipeError.classList.add('hidden');
}

// Helper functions
function getMoodColor(mood) {
    const colors = {
        happy: 'bg-yellow-100 text-yellow-800',
        sad: 'bg-blue-100 text-blue-800',
        energetic: 'bg-orange-100 text-orange-800',
        relaxed: 'bg-green-100 text-green-800',
        adventurous: 'bg-purple-100 text-purple-800',
    };
    return colors[mood] || 'bg-gray-100 text-gray-800';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function setAddUserLoading(loading) {
    addUserBtn.disabled = loading;
    if (loading) {
        addUserBtnText.classList.add('hidden');
        addUserBtnLoading.classList.remove('hidden');
    } else {
        addUserBtnText.classList.remove('hidden');
        addUserBtnLoading.classList.add('hidden');
    }
}

function showUserError(message) {
    userErrorText.textContent = message;
    userError.classList.remove('hidden');
    setTimeout(() => {
        userError.classList.add('hidden');
    }, 5000);
}

function showUserSuccess(message) {
    userSuccessText.textContent = message;
    userSuccess.classList.remove('hidden');
    setTimeout(() => {
        userSuccess.classList.add('hidden');
    }, 5000);
}

function hideUserMessages() {
    userError.classList.add('hidden');
    userSuccess.classList.add('hidden');
}

