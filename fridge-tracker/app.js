const RECIPES = [
  {
    name: 'Tomato Pasta',
    translations: {
      ja: {
        name: 'トマトパスタ',
        description: 'トマトと常備食材で作れる手早いパスタです。',
      },
    },
    ingredients: ['tomato', 'pasta', 'garlic', 'olive oil'],
    description: 'A quick pasta dish using tomatoes and pantry staples.',
  },
  {
    name: 'Veggie Stir Fry',
    translations: {
      ja: {
        name: '野菜炒め',
        description: '期限が近い野菜を使い切るのにぴったりの炒め物です。',
      },
    },
    ingredients: ['broccoli', 'carrot', 'bell pepper', 'soy sauce'],
    description: 'A fresh stir fry for vegetables that are about to expire.',
  },
  {
    name: 'Omelette',
    translations: {
      ja: {
        name: 'オムレツ',
        description: '冷蔵庫にある食材で作れる、手軽なしょっぱいオムレツです。',
      },
    },
    ingredients: ['egg', 'milk', 'cheese', 'spinach'],
    description: 'A fast savory omelette with simple fridge items.',
  },
  {
    name: 'Salad Bowl',
    translations: {
      ja: {
        name: 'サラダボウル',
        description: '新鮮な葉物野菜や野菜を使えるヘルシーなサラダです。',
      },
    },
    ingredients: ['lettuce', 'tomato', 'cucumber', 'olive oil'],
    description: 'A healthy salad to use fresh greens and veggies.',
  },
  {
    name: 'Pantry Soup',
    translations: {
      ja: {
        name: 'パントリースープ',
        description: 'よくある食材で作れる、体が温まるスープです。',
      },
    },
    ingredients: ['onion', 'carrot', 'celery', 'broth'],
    description: 'A warming soup that works with many common ingredients.',
  },
];

const I18N = {
  en: {
    appTitle: 'Fridge Tracker',
    appSubtitle: 'Track ingredients, expiry dates, and get recipe ideas.',
    addIngredientTitle: 'Add an ingredient',
    ingredientLabel: 'Ingredient',
    ingredientPlaceholder: 'e.g. Tomato',
    quantityLabel: 'Quantity',
    quantityPlaceholder: 'e.g. 2 pcs, 1 bowl',
    expiryLabel: 'Expiry date',
    saveButton: 'Save ingredient',
    myFridgeTitle: 'My fridge',
    recipeIdeasTitle: 'Recipe ideas',
    emptyIngredients: 'No ingredients yet. Start adding what is in your fridge.',
    emptyRecipes: 'Add ingredients to see recipe suggestions.',
    loading: 'Loading fridge data...',
    dbErrorTitle: 'Database connection needs setup.',
    dbErrorBody: 'Check db/config.js and make sure the Supabase tables from db/schema.sql exist.',
    quantityPrefix: 'Quantity',
    expiryPrefix: 'Expiry',
    noneListed: 'None listed',
    markUsed: 'Mark used',
    remove: 'Remove',
    expired: 'Expired',
    expiresToday: 'Expires today',
    expiringSoon: 'Expiring soon',
    daysLeft: days => `${days} day${days === 1 ? '' : 's'} left`,
    itemCount: count => `${count} item${count === 1 ? '' : 's'}`,
    ideaCount: count => `${count} idea${count === 1 ? '' : 's'}`,
    missingIngredients: (matchCount, total, missing) => `You have ${matchCount}/${total} ingredients. Missing: ${missing}.`,
    allIngredients: 'You have all ingredients for this recipe!',
  },
  ja: {
    appTitle: '冷蔵庫トラッカー',
    appSubtitle: '食材、賞味期限、レシピのアイデアを管理します。',
    addIngredientTitle: '食材を追加',
    ingredientLabel: '食材',
    ingredientPlaceholder: '例: トマト',
    quantityLabel: '数量',
    quantityPlaceholder: '例: 2個、1袋',
    expiryLabel: '賞味期限',
    saveButton: '食材を保存',
    myFridgeTitle: '冷蔵庫の中身',
    recipeIdeasTitle: 'レシピ案',
    emptyIngredients: 'まだ食材がありません。冷蔵庫にあるものを追加しましょう。',
    emptyRecipes: '食材を追加するとレシピ案が表示されます。',
    loading: '冷蔵庫のデータを読み込み中...',
    dbErrorTitle: 'データベース接続の設定が必要です。',
    dbErrorBody: 'db/config.js と db/schema.sql のテーブル設定を確認してください。',
    quantityPrefix: '数量',
    expiryPrefix: '期限',
    noneListed: '未入力',
    markUsed: '使用済み',
    remove: '削除',
    expired: '期限切れ',
    expiresToday: '今日まで',
    expiringSoon: 'まもなく期限',
    daysLeft: days => `あと${days}日`,
    itemCount: count => `${count}件`,
    ideaCount: count => `${count}件`,
    missingIngredients: (matchCount, total, missing) => `${total}個中${matchCount}個の食材があります。足りないもの: ${missing}。`,
    allIngredients: 'このレシピに必要な食材がすべてあります！',
  },
};

const form = document.getElementById('ingredient-form');
const ingredientList = document.getElementById('ingredient-list');
const summaryEl = document.getElementById('summary');
const recipeList = document.getElementById('recipe-list');
const recipeSummary = document.getElementById('recipe-summary');
const languageButtons = document.querySelectorAll('[data-language]');

let ingredients = [];
let currentLanguage = 'en';

form.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const quantity = String(formData.get('quantity') || '').trim();
  const expiry = String(formData.get('expiry') || '');

  if (!name || !expiry) return;

  const ingredient = {
    name,
    quantity,
    expiry,
    addedAt: new Date().toISOString(),
  };

  try {
    const savedIngredient = await fridgeDb.addIngredient(ingredient);
    const normalizedIngredient = normalizeIngredient(savedIngredient);
    if (normalizedIngredient) {
      ingredients.push(normalizedIngredient);
    }
  } catch (error) {
    showDatabaseError(error);
    return;
  }

  form.reset();
  render();
});

languageButtons.forEach(button => {
  button.addEventListener('click', async () => {
    currentLanguage = button.dataset.language;
    render();

    try {
      await saveLanguage();
    } catch (error) {
      showDatabaseError(error);
    }
  });
});

async function init() {
  renderTranslations();
  ingredientList.innerHTML = `<p class="muted">${escapeHtml(t('loading'))}</p>`;
  recipeList.innerHTML = `<p class="muted">${escapeHtml(t('loading'))}</p>`;
  summaryEl.textContent = t('itemCount', 0);
  recipeSummary.textContent = t('ideaCount', 0);

  try {
    const [savedIngredients, savedLanguage] = await Promise.all([
      fridgeDb.loadIngredients(),
      loadLanguage(),
    ]);

    ingredients = savedIngredients
      .map(normalizeIngredient)
      .filter(Boolean);
    currentLanguage = savedLanguage;
    render();
  } catch (error) {
    showDatabaseError(error);
  }
}

async function loadLanguage() {
  const language = await fridgeDb.loadLanguage();
  return I18N[language] ? language : 'en';
}

function saveLanguage() {
  return fridgeDb.saveLanguage(currentLanguage);
}

function render() {
  renderTranslations();

  const today = startOfDay(new Date());
  if (ingredients.length === 0) {
    ingredientList.innerHTML = `<p class="muted">${escapeHtml(t('emptyIngredients'))}</p>`;
    summaryEl.textContent = t('itemCount', 0);
  } else {
    const sorted = [...ingredients].sort((a, b) => parseLocalDate(a.expiry) - parseLocalDate(b.expiry));
    summaryEl.textContent = t('itemCount', sorted.length);
    ingredientList.innerHTML = sorted.map(item => {
      const expiryDate = parseLocalDate(item.expiry);
      const daysLeft = Math.round((expiryDate - today) / (1000 * 60 * 60 * 24));
      const status = daysLeft < 0 ? 'expired' : daysLeft <= 2 ? 'soon' : '';
      const label = getExpiryLabel(daysLeft);
      const safeId = escapeHtml(item.id);
      return `
        <div class="ingredient-item ${status}">
          <div class="item-header">
            <h3>${escapeHtml(item.name)}</h3>
            <span class="tag ${status}">${escapeHtml(label)}</span>
          </div>
          <div class="item-meta">
            <span>${escapeHtml(t('quantityPrefix'))}: ${escapeHtml(item.quantity || t('noneListed'))}</span>
            <span>${escapeHtml(t('expiryPrefix'))}: ${escapeHtml(formatDate(expiryDate))}</span>
          </div>
          <div class="actions">
            <button class="action-button" data-action="use" data-id="${safeId}">${escapeHtml(t('markUsed'))}</button>
            <button class="action-button danger" data-action="remove" data-id="${safeId}">${escapeHtml(t('remove'))}</button>
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
    recipeList.innerHTML = `<p class="muted">${escapeHtml(t('emptyRecipes'))}</p>`;
    recipeSummary.textContent = t('ideaCount', 0);
    return;
  }

  recipeSummary.textContent = t('ideaCount', usable.length);
  recipeList.innerHTML = usable.map(recipe => {
    const recipeName = getRecipeText(recipe, 'name');
    const recipeDescription = getRecipeText(recipe, 'description');
    const missing = recipe.missing.join(', ');
    const missingNotes = recipe.missing.length > 0
      ? `<p class="match">${escapeHtml(t('missingIngredients', recipe.matchCount, recipe.ingredients.length, missing))}</p>`
      : `<p class="match">${escapeHtml(t('allIngredients'))}</p>`;
    return `
      <div class="recipe-item">
        <h3>${escapeHtml(recipeName)}</h3>
        <p>${escapeHtml(recipeDescription)}</p>
        ${missingNotes}
      </div>
    `;
  }).join('');
}

ingredientList.addEventListener('click', async event => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  const { action, id } = button.dataset;

  if (action !== 'remove' && action !== 'use') return;

  try {
    await fridgeDb.deleteIngredient(id);
    ingredients = ingredients.filter(item => item.id !== id);
    render();
  } catch (error) {
    showDatabaseError(error);
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `ingredient-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeIngredient(item) {
  if (!item || typeof item !== 'object') return null;

  const name = String(item.name || '').trim();
  const expiry = String(item.expiry || '');
  if (!name || Number.isNaN(parseLocalDate(expiry).getTime())) return null;

  return {
    id: String(item.id || createId()),
    name,
    quantity: String(item.quantity || '').trim(),
    expiry,
    addedAt: String(item.addedAt || new Date().toISOString()),
  };
}

function parseLocalDate(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(NaN);

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date(NaN);
  }

  return date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getExpiryLabel(daysLeft) {
  if (daysLeft < 0) return t('expired');
  if (daysLeft === 0) return t('expiresToday');
  if (daysLeft <= 2) return t('expiringSoon');
  return t('daysLeft', daysLeft);
}

function formatDate(date) {
  const locale = currentLanguage === 'ja' ? 'ja-JP' : undefined;
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function renderTranslations() {
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  languageButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.language === currentLanguage);
  });
}

function getRecipeText(recipe, key) {
  return recipe.translations?.[currentLanguage]?.[key] || recipe[key];
}

function t(key, ...args) {
  const value = I18N[currentLanguage][key] || I18N.en[key];
  return typeof value === 'function' ? value(...args) : value;
}

function showDatabaseError(error) {
  console.error(error);
  renderTranslations();
  ingredientList.innerHTML = `
    <div class="notice error">
      <strong>${escapeHtml(t('dbErrorTitle'))}</strong>
      <p>${escapeHtml(t('dbErrorBody'))}</p>
    </div>
  `;
  recipeList.innerHTML = '';
  summaryEl.textContent = t('itemCount', 0);
  recipeSummary.textContent = t('ideaCount', 0);
}

init();
