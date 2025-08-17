import icons from 'url:../../img/icons.svg';
import View from './View.js';

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

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const currentPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
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
