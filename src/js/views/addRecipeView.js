import icons from 'url:../../img/icons.svg';
import View from './View.js';

/**
 * Build markup for a single pagination button (helper copy present in this file).
 *
 * @param {'prev'|'next'} type Button type to render
 * @param {number} currentPage Current page (1-based)
 * @returns {string} HTML string for the button
 * @author Duško Vokić
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
 * View for handling the "Add recipe" modal,
 * including opening/closing and form submission.
 *
 * @this {addRecipeView} View instance
 * @author Duško Vokić
 */
class addRecipeView extends View {
  /** @private */ _parentElement = document.querySelector('.upload');
  /** @private */ _message = 'Recipe was successfully uploaded :)';
  /** @private */ _window = document.querySelector('.add-recipe-window');
  /** @private */ _overlay = document.querySelector('.overlay');
  /** @private */ _btnOpen = document.querySelector('.nav__btn--add-recipe');
  /** @private */ _btnClose = document.querySelector('.btn--close-modal');

  /**
   * Set up show/hide handlers on construction.
   *
   * @constructor
   * @this {addRecipeView} View instance
   * @author Duško Vokić
   */
  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  /**
   * Toggle visibility of the add-recipe modal and overlay.
   *
   * @returns {void}
   * @this {addRecipeView} View instance
   * @author Duško Vokić
   */
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  /**
   * Attach click handler to open the modal.
   *
   * @returns {void}
   * @this {addRecipeView} View instance
   * @author Duško Vokić
   */
  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  /**
   * Attach click handlers to close the modal (X button and overlay).
   *
   * @returns {void}
   * @this {addRecipeView} View instance
   * @author Duško Vokić
   */
  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  /**
   * Register submit handler for the upload form.
   * Serializes form fields into an object and passes it to the controller.
   *
   * @param {(data: Record<string,string>) => void} handler Controller callback
   * @returns {void}
   * @this {addRecipeView} View instance
   * @author Duško Vokić
   */
  _addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  /**
   * No-op: this view does not render via _generateMarkup().
   *
   * @returns {string|undefined} Not used in this view
   * @this {addRecipeView} View instance
   * @author Duško Vokić
   */
  _generateMarkup() {}
}

export default new addRecipeView();
