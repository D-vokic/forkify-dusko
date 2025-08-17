import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';
import View from './View.js';

/** @typedef {import('../model.js').Recipe} Recipe */

/**
 * Renders the user's bookmarked recipes list.
 *
 * @this {BookmarksView} View instance
 * @author Duško Vokić
 */
class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it :)';
  _message = '';

  /**
   * Register handler to render bookmarks on page load.
   *
   * @param {() => void} handler Controller callback to render bookmarks
   * @returns {void}
   * @this {BookmarksView} View instance
   * @author Duško Vokić
   */
  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  /**
   * Create markup for all bookmarked recipes.
   *
   * @returns {string} Concatenated HTML for the bookmarks list
   * @this {BookmarksView} View instance
   * @author Duško Vokić
   */
  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarksView();
