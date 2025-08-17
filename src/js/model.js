import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

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

export const loadRecipe = async function (id) {
  try {
    // UČITAVANJE RECEPTA — OBAVEZNO prosledi ?key=KEY
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // KREIRAJ STANJE iz odgovora i ZADRŽI recipe.key
    state.recipe = createRecipeObject(data);

    // Obeleži da li je recept već u bookmark-ovima
    state.recipe.bookmarked = state.bookmarks.some(b => b.id === id);
  } catch (err) {
    console.error(`${err} 👾👾👾👾`);
    throw err;
  }
};

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
    console.error(`${err} 👾👾👾👾`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // new_quantity = old_quantity * (new_servings / old_servings)
  });
  state.recipe.servings = newServings;
};

function persistBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
  // Dodaj bookmark
  state.bookmarks.push(recipe);

  // Obeleži trenutni recept kao bookmarkovan ako je to taj
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // Uvek persisti kad menjaš listu bookmarkova
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Nađi indeks i izbaci
  const index = state.bookmarks.findIndex(el => el.id === id);
  if (index === -1) return;

  state.bookmarks.splice(index, 1);

  // Ako je obrisani baš trenutno otvoren recept, skini zastavicu
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// Pomoćna funkcija za ručno brisanje bookmarkova (ne koristi u produkciji)
// const clearBookmarks = function () {
//   localStorage.removeItem('bookmarks');
// };

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1])
      .map(entry => {
        // očekuje se "quantity,unit,description"
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

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // Pošalji recept na API — OBAVEZNO sa ?key=KEY
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    // Upisi u state i zadrži key
    state.recipe = createRecipeObject(data);

    // Po defaultu odmah dodaj kao bookmark
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
