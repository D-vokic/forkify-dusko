import icons from 'url:../../img/icons.svg';
import View from './View.js';

/** @typedef {import('../model.js').Recipe} Recipe */
/** @typedef {{query:string, results:Recipe[], page:number, resultsPerPage:number}} SearchState */

/**
 * Build markup for a single pagination button.
 *
 * @param {'prev'|'next'} type Which button to render
 * @param {number} currentPage Current page (1-based)
 * @returns {string} HTML string for the button
 * @author Dusko Vokic
 */
const generateMarkupButton = (type, currentPage) => {
  const isPrev = type === 'prev';
  const target = isPrev ? currentPage - 1 : currentPage + 1;

  if (isPrev) {
    return `
      <button data-goto="${target}" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${target}</span>
      </button>
    `;
  }

  return `
    <button data-goto="${target}" class="btn--inline pagination__btn--next">
      <span>Page ${target}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>
  `;
};

/**
 * Handles rendering and click events for pagination controls.
 * Expects `_data` to be a search state object.
 *
 * @this {PaginationView} View instance
 * @author Dusko Vokic
 */
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  /**
   * Register click handler for pagination buttons.
   * Reads the `data-goto` attribute and passes it to the controller.
   *
   * @param {(goToPage:number) => void} handler Controller callback
   * @returns {void}
   * @this {PaginationView} View instance
   * @author Dusko Vokic
   */
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  /**
   * Create markup for pagination based on current page and total pages.
   *
   * @returns {string} HTML for prev/next buttons (or empty string when not needed)
   * @this {PaginationView} View instance
   * @author Dusko Vokic
   */
  _generateMarkup() {
    /** @type {SearchState} */
    const currentSearch = /** @type {any} */ (this._data);

    const currentPage = currentSearch.page;
    const numPages = Math.ceil(
      currentSearch.results.length / currentSearch.resultsPerPage
    );

    if (currentPage === 1 && numPages > 1) {
      return generateMarkupButton('next', currentPage);
    }

    if (currentPage === numPages && numPages > 1) {
      return generateMarkupButton('prev', currentPage);
    }

    if (currentPage < numPages) {
      return (
        generateMarkupButton('prev', currentPage) +
        generateMarkupButton('next', currentPage)
      );
    }

    return '';
  }
}

export default new PaginationView();
