// @ts-check
import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

/**
 * @typedef {Object} Ingredient
 * @property {number|null} quantity Quantity (nullable)
 * @property {string} unit Unit of measure
 * @property {string} description Ingredient description
 */

/**
 * @typedef {Object} Recipe
 * @property {string} id
 * @property {string} title
 * @property {string} publisher
 * @property {string} sourceUrl
 * @property {string} image
 * @property {number} servings
 * @property {number} cookingTime
 * @property {Ingredient[]} ingredients
 * @property {boolean} [bookmarked]
 * @property {string} [key]
 */

/**
 * @typedef {Object} State
 * @property {Recipe} recipe
 * @property {{query:string, results:Recipe[], page:number, resultsPerPage:number}} search
 * @property {Recipe[]} bookmarks
 */

/** @type {State} */
export const state = {
  recipe: /** @type {any} */ ({}),
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

/**
 * Build a normalized Recipe object from the API response.
 *
 * @param {{data:{recipe:any}}} data Raw API response payload
 * @returns {Recipe} Normalized recipe entity
 * @author Dusko Vokic
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 * Load a recipe by ID and write it into the global state.
 *
 * @param {string} id Recipe ID
 * @returns {Promise<void>} Updates `state.recipe`; throws on failure
 * @author Dusko Vokic
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    state.recipe.bookmarked = state.bookmarks.some(b => b.id === id);
  } catch (err) {
    throw err;
  }
};

/**
 * Load search results for a query and store them in state.
 *
 * @param {string} query Search term
 * @returns {Promise<void>} Updates `state.search`; throws on failure
 * @author Dusko Vokic
 */
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

/**
 * Get a single page of search results.
 *
 * @param {number} [page=state.search.page] 1-based page index
 * @returns {Recipe[]} Slice of results for the requested page
 * @author Dusko Vokic
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

/**
 * Update servings and proportionally recalculate ingredient quantities.
 *
 * @param {number} newServings New servings count
 * @returns {void} Mutates `state.recipe` in place
 * @author Dusko Vokic
 */
export const updateServings = function (newServings) {
  const { servings: oldServings } = state.recipe;

  state.recipe.ingredients.forEach(ing => {
    if (ing.quantity == null) return; // skip null quantities
    ing.quantity = (ing.quantity * newServings) / oldServings;
  });

  state.recipe.servings = newServings;
};

/**
 * Persist bookmarks to localStorage.
 *
 * @returns {void} Writes `state.bookmarks` to localStorage
 * @author Dusko Vokic
 */
function persistBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

/**
 * Add a recipe to bookmarks (and flag current recipe as bookmarked if applicable).
 *
 * @param {Recipe} recipe Recipe to bookmark
 * @returns {void} Updates `state.bookmarks` and `state.recipe.bookmarked`
 * @author Dusko Vokic
 */
export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

/**
 * Remove a recipe from bookmarks by ID.
 *
 * @param {string} id Recipe ID
 * @returns {void} Updates `state.bookmarks` and `state.recipe.bookmarked`
 * @author Dusko Vokic
 */
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  if (index === -1) return;

  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

/**
 * Initialize bookmarks from localStorage on startup.
 *
 * @returns {void} Populates `state.bookmarks` if storage exists
 * @author Dusko Vokic
 */
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// Helper for manual cleanup (not for production)
// const clearBookmarks = function () {
//   localStorage.removeItem('bookmarks');
// };

/**
 * Parse and validate a new recipe from the form, send it to the API,
 * then store the result in state and auto-bookmark it.
 *
 * @param {Record<string,string>} newRecipe Raw form fields (name/value pairs)
 * @returns {Promise<void>} Updates state and bookmarks; throws on invalid format or API errors
 * @author Dusko Vokic
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1])
      .map(entry => {
        const ingArr = entry[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, please use the correct format!'
          );
        const [quantity, unit, description] = ingArr;

        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    const recipePayload = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipePayload);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
