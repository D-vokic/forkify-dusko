import icons from 'url:../../img/icons.svg';
import View from './View.js';

/** @typedef {import('../model.js').Recipe} Recipe */

/**
 * Renders a single search result (recipe preview) as a list item.
 * Used by ResultsView to compose the results list.
 *
 * @this {PreviewView} View instance
 * @author Dusko Vokic
 */
class PreviewView extends View {
  _parentElement = '';

  /**
   * Create markup for one preview item.
   *
   * Highlights the active item if its id matches the current hash.
   *
   * @returns {string} Markup for a `<li class="preview">…</li>` element
   * @this {PreviewView} View instance
   * @author Dusko Vokic
   */
  _generateMarkup() {
    const id = window.location.hash.slice(1);

    return `
      <li class="preview">
        <a
          class="preview__link ${this._data.id === id ? 'preview__link--active' : ''}"
          href="#${this._data.id}"
        >
          <figure class="preview__fig">
            <img src="${this._data.image}" alt="${this._data.title}" />
          </figure>

          <div class="preview__data">
            <h4 class="preview__title">${this._data.title}</h4>
            <p class="preview__publisher">${this._data.publisher}</p>

            <div class="preview__user-generated ${this._data.key ? '' : 'hidden'}">
              <svg>
                <use href="${icons}#icon-user"></use>
              </svg>
            </div>

          </div>
        </a>
      </li>
    `;
  }
}

export default new PreviewView();
