const INGREDIENT_STORAGE_KEY = 'fridge-tracker-ingredients';
const RECIPES = [
  {
    name: 'Tomato Pasta',
    ingredients: ['tomato', 'pasta', 'garlic', 'olive oil'],
    description: 'A quick pasta dish using tomatoes and pantry staples.',
  },
  {
    name: 'Veggie Stir Fry',
    ingredients: ['broccoli', 'carrot', 'bell pepper', 'soy sauce'],
    description: 'A fresh stir fry for vegetables that are about to expire.',
  },
  {
    name: 'Omelette',
    ingredients: ['egg', 'milk', 'cheese', 'spinach'],
    description: 'A fast savory omelette with simple fridge items.',
  },
  {
    name: 'Salad Bowl',
    ingredients: ['lettuce', 'tomato', 'cucumber', 'olive oil'],
    description: 'A healthy salad to use fresh greens and veggies.',
  },
  {
    name: 'Pantry Soup',
    ingredients: ['onion', 'carrot', 'celery', 'broth'],
    description: 'A warming soup that works with many common ingredients.',
  },
];

const form = document.getElementById('ingredient-form');
const ingredientList = document.getElementById('ingredient-list');
const summaryEl = document.getElementById('summary');
const recipeList = document.getElementById('recipe-list');
const recipeSummary = document.getElementById('recipe-summary');

let ingredients = loadIngredients();

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.name.value.trim();
  const quantity = form.quantity.value.trim();
  const expiry = form.expiry.value;

  if (!name || !expiry) return;

  ingredients.push({
    id: crypto.randomUUID(),
    name,
    quantity,
    expiry,
    addedAt: new Date().toISOString(),
  });

  saveIngredients();
  form.reset();
  render();
});

function loadIngredients() {
  const saved = localStorage.getItem(INGREDIENT_STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved).map(item => ({ ...item }));
  } catch {
    return [];
  }
}

function saveIngredients() {
  localStorage.setItem(INGREDIENT_STORAGE_KEY, JSON.stringify(ingredients));
}

function render() {
  const now = new Date();
  if (ingredients.length === 0) {
    ingredientList.innerHTML = '<p class="muted">No ingredients yet. Start adding what is in your fridge.</p>';
    summaryEl.textContent = '0 items';
  } else {
    const sorted = [...ingredients].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    summaryEl.textContent = `${sorted.length} item${sorted.length === 1 ? '' : 's'}`;
    ingredientList.innerHTML = sorted.map(item => {
      const expiryDate = new Date(item.expiry);
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      const status = daysLeft < 0 ? 'expired' : daysLeft <= 2 ? 'soon' : '';
      const label = status === 'expired' ? 'Expired' : status === 'soon' ? 'Expiring soon' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
      return `
        <div class="ingredient-item ${status}">
          <div class="item-header">
            <h3>${escapeHtml(item.name)}</h3>
            <span class="tag ${status}">${label}</span>
          </div>
          <div class="item-meta">
            <span>Quantity: ${escapeHtml(item.quantity || '—')}</span>
            <span>Expiry: ${expiryDate.toLocaleDateString()}</span>
          </div>
          <div class="actions">
            <button class="action-button" data-action="use" data-id="${item.id}">Mark used</button>
            <button class="action-button danger" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderRecipes();
}

function renderRecipes() {
  const availableNames = new Set(ingredients.map(item => item.name.toLowerCase()));
  const candidateRecipes = RECIPES.map(recipe => {
    const missing = recipe.ingredients.filter(i => !availableNames.has(i.toLowerCase()));
    const matchCount = recipe.ingredients.length - missing.length;
    return { ...recipe, missing, matchCount };
  }).sort((a, b) => b.matchCount - a.matchCount || a.missing.length - b.missing.length);

  const usable = candidateRecipes.filter(recipe => recipe.matchCount > 0);
  if (usable.length === 0) {
    recipeList.innerHTML = '<p class="muted">Add ingredients to see recipe suggestions.</p>';
    recipeSummary.textContent = '0 ideas';
    return;
  }

  recipeSummary.textContent = `${usable.length} idea${usable.length === 1 ? '' : 's'}`;
  recipeList.innerHTML = usable.map(recipe => {
    const missingNotes = recipe.missing.length > 0
      ? `<p class="match">You have ${recipe.matchCount}/${recipe.ingredients.length} ingredients. Missing: ${recipe.missing.join(', ')}.</p>`
      : '<p class="match">You have all ingredients for this recipe!</p>';
    return `
      <div class="recipe-item">
        <h3>${escapeHtml(recipe.name)}</h3>
        <p>${escapeHtml(recipe.description)}</p>
        ${missingNotes}
      </div>
    `;
  }).join('');
}

ingredientList.addEventListener('click', event => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === 'remove') {
    ingredients = ingredients.filter(item => item.id !== id);
    saveIngredients();
    render();
  }

  if (action === 'use') {
    ingredients = ingredients.filter(item => item.id !== id);
    saveIngredients();
    render();
  }
});

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

render();
