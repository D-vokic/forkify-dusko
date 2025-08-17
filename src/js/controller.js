// @ts-check
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

/**
 * Orchestrates Model ↔ View interactions (MVC controller).
 * Wires UI events to data actions and keeps views in sync.
 * @author Duško Vokić
 */

/**
 * Load & render a recipe for the current hash.
 *
 * - Shows a spinner
 * - Updates results/bookmarks to reflect selection
 * - Loads recipe from API into state
 * - Renders the recipe view
 *
 * @returns {Promise<void>} Resolves when rendering finishes
 * @author Duško Vokić
 */
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // 0) Highlight selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Update bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 2) Load recipe
    await model.loadRecipe(id);

    // 3) Render recipe
    recipeView.render(model.state.recipe);
  } catch {
    recipeView.renderError();
  }
};

/**
 * Handle search submit:
 * - reads query
 * - loads results
 * - renders first page & pagination controls
 *
 * @returns {Promise<void>} Resolves when views are rendered
 * @author Duško Vokić
 */
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load results
    await model.loadSearchResults(query);

    // 3) Render current page
    resultsView.render(model.getSearchResultsPage());

    // 4) Render pagination
    paginationView.render(model.state.search);
  } catch {
    // Fallback UI (optional; if your ResultsView supports renderError)
    if (typeof resultsView.renderError === 'function')
      resultsView.renderError();
  }
};

/**
 * Handle pagination click:
 * - renders requested page
 * - updates pagination controls
 *
 * @param {number} goToPage 1-based page index to render
 * @returns {void} Updates the results & pagination views
 * @author Duško Vokić
 */
function controlPagination(goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
}

/**
 * Update servings:
 * - updates quantities in state
 * - re-renders recipe view efficiently
 *
 * @param {number} newServings New servings count
 * @returns {void} Mutates state and updates the view
 * @author Duško Vokić
 */
const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

/**
 * Toggle bookmark for the current recipe and sync views.
 *
 * @returns {void} Updates state, recipe view and bookmarks list
 * @author Duško Vokić
 */
const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

/**
 * Render bookmarks on init (and when storage changes, if hooked).
 *
 * @returns {void} Renders bookmarks view from state
 * @author Duško Vokić
 */
function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

/**
 * Upload a new recipe from the form and update the UI:
 * - shows spinner
 * - uploads to API
 * - renders recipe & success message
 * - refreshes bookmarks
 * - updates URL (pushState)
 * - closes modal after a delay
 *
 * @param {Record<string, string>} newRecipe Raw form fields (name/value)
 * @returns {Promise<void>} Throws on validation/API error
 * @author Duško Vokić
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(/** @type {Error} */ (err).message);
  }
};

/**
 * App entry point — registers all UI handlers.
 *
 * @returns {void} Sets up event listeners on views
 * @author Duško Vokić
 */
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};
init();
