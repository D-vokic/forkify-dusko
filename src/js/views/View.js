import icons from 'url:../../img/icons.svg';

/**
 * Base View class. Child classes must implement `_generateMarkup`
 * and define `_parentElement`, `_errorMessage`, `_message`.
 *
 * @this {Object} View instance
 * @author Dusko Vokic
 */
export default class View {
  _data;

  /**
   * Render the received object to the DOM.
   *
   * @param {object | object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Dusko Vokic
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Update only changed text and attributes in the DOM (diffing).
   *
   * @param {object | object[]} data The new data to update the view with
   * @returns {void}
   * @this {Object} View instance
   * @author Dusko Vokic
   */
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDom = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDom.querySelectorAll('*'));
    const currentElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = currentElements[i];
      // Update changed text
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        curEl.textContent = newEl.textContent;
      }

      // Update changed attributes
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  /**
   * Clear the parent element.
   *
   * @returns {void}
   * @this {Object} View instance
   * @author Dusko Vokic
   */
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Render a loading spinner.
   *
   * @returns {void}
   * @this {Object} View instance
   * @author Dusko Vokic
   */
  renderSpinner() {
    const markup = `
          <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render an error message.
   *
   * @param {string} [message=this._errorMessage] Error text to show
   * @returns {void}
   * @this {Object} View instance
   * @author Dusko Vokic
   */
  renderError(message = this._errorMessage) {
    const markup = `
          <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
              <p>${message}</p>
          </div>
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Render a generic informational message.
   *
   * @param {string} [message=this._message] Message text to show
   * @returns {void}
   * @this {Object} View instance
   * @author Dusko Vokic
   */
  renderMessage(message = this._message) {
    const markup = `
          <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
              <p>${message}</p>
          </div>
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
