const fridgeDb = (() => {
  const SETTINGS_LANGUAGE_KEY = 'language';
  const config = window.FRIDGE_SUPABASE_CONFIG || {};
  let client = null;
  let setupError = null;

  if (!window.supabase) {
    setupError = new Error('Supabase client script is missing.');
  } else if (
    !config.url ||
    !config.anonKey ||
    config.url === 'YOUR_SUPABASE_PROJECT_URL' ||
    config.anonKey === 'YOUR_SUPABASE_ANON_KEY'
  ) {
    setupError = new Error('Add your Supabase URL and anon key in db/config.js.');
  } else {
    client = window.supabase.createClient(config.url, config.anonKey);
  }

  function ensureReady() {
    if (setupError) throw setupError;
  }

  function mapIngredient(row) {
    return {
      id: row.id,
      name: row.name,
      quantity: row.quantity || '',
      expiry: row.expiry,
      addedAt: row.added_at,
    };
  }

  function mapIngredientForInsert(ingredient) {
    return {
      name: ingredient.name,
      quantity: ingredient.quantity || '',
      expiry: ingredient.expiry,
      added_at: ingredient.addedAt,
    };
  }

  async function loadIngredients() {
    ensureReady();

    const { data, error } = await client
      .from('ingredients')
      .select('id, name, quantity, expiry, added_at')
      .order('expiry', { ascending: true });

    if (error) throw error;
    return data.map(mapIngredient);
  }

  async function addIngredient(ingredient) {
    ensureReady();

    const { data, error } = await client
      .from('ingredients')
      .insert(mapIngredientForInsert(ingredient))
      .select('id, name, quantity, expiry, added_at')
      .single();

    if (error) throw error;
    return mapIngredient(data);
  }

  async function deleteIngredient(id) {
    ensureReady();

    const { error } = await client
      .from('ingredients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async function loadLanguage() {
    ensureReady();

    const { data, error } = await client
      .from('app_settings')
      .select('value')
      .eq('key', SETTINGS_LANGUAGE_KEY)
      .maybeSingle();

    if (error) throw error;
    return data?.value || 'en';
  }

  async function saveLanguage(language) {
    ensureReady();

    const { error } = await client
      .from('app_settings')
      .upsert({
        key: SETTINGS_LANGUAGE_KEY,
        value: language,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  return {
    loadIngredients,
    addIngredient,
    deleteIngredient,
    loadLanguage,
    saveLanguage,
  };
})();
