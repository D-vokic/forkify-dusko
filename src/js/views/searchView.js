/**
 * Handles search form interactions (input + submit).
 * @author Dusko Vokic
 */
class SearchView {
  /** Root element for the search form. */
  _parentElement = document.querySelector('.search');

  /**
   * Read the search query from the input and clear the field.
   *
   * @returns {string} The current search query string
   * @this {SearchView} View instance
   * @author Dusko Vokic
   */
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  /**
   * Clear the search input field.
   *
   * @returns {void}
   * @this {SearchView} View instance
   * @author Dusko Vokic
   */
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  /**
   * Register a submit handler for the search form.
   *
   * @param {() => void} handler Controller callback to execute on submit
   * @returns {void}
   * @this {SearchView} View instance
   * @author Dusko Vokic
   */
  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
