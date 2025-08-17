import icons from 'url:../../img/icons.svg';
import View from './View.js';
import previewView from './previewView.js';

/** @typedef {import('../model.js').Recipe} Recipe */

/**
 * Renders the list of search results (recipes).
 * Uses `previewView` to render each result item.
 *
 * @this {ResultsView} View instance
 * @author Dusko Vokic
 */
class ResultsView extends View {
  /** @private */ _parentElement = document.querySelector('.results');
  /** @private */ _errorMessage = 'No recipes found for your query! Please try again.)';
  /** @private */ _message = '';

  /**
   * Create markup for the results list.
   *
   * @returns {string} Concatenated markup for all results
   * @this {ResultsView} View instance
   * @author Dusko Vokic
   */
  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}

export default new ResultsView();
