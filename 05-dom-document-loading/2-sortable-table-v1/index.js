export default class SortableTable {
  element;
  subElements;
  constructor(header = [], data = []) {
    this.header = header;
    this.data = data;
    this.render();
  }

  template(tableData) {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerTemplate()}
          </div>
          <div data-element="body" class="sortable-table__body">
           ${this.dataTemplate(tableData)}
           </div>
           <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
           <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
             <div>
               <p>No products satisfies your filter criteria</p>
               <button type="button" class="button-primary-outline">Reset all filters</button>
             </div>
           </div>
        </div>
      </div>`;
  }

  headerTemplate() {
    return `${this.header.map(item => `
               <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="">
                   <span>${item.title}</span>
               </div>`).join('')}`;
  }

  dataTemplate() {
    return `${this.data.map(item => `
              <a href="${item.id}" class="sortable-table__row">
                ${this.header.map(value => {
                  if (value.id === 'images') {
                    return this.renderImages(item);
                  }
                  return `
                  <div class="sortable-table__cell">${item[value.id]}</div>`;}).join('')}
              </a>`).join('')}`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template(this.data);
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }
    return result;
  }

  sort(fieldValue = 'title', orderValue = 'asc') {

    if (fieldValue === 'title') {
      orderValue === 'asc' ? this.data.sort((a, b) => a[fieldValue].localeCompare(b[fieldValue], 'ru', { sensitivity: 'base' })) : this.data.sort((a, b) => b[fieldValue].localeCompare(a[fieldValue], 'ru', { sensitivity: 'base' }));
    } else {
      orderValue === 'asc' ? this.data.sort((a, b) => a[fieldValue] - b[fieldValue]) : this.data.sort((a, b) => b[fieldValue] - a[fieldValue]);
    }
    this.update();
  }

  update() {
    this.subElements.body.innerHTML = this.dataTemplate();
  }

  renderImages(data) {

    if (this.header.find(item => item.template)) {
      return this.header[0].template(data);
    }
    return `
      <div class="sortable-table__cell">
         <img class="sortable-table-image" alt="Image" src="${data[0]?.url || 'https://via.placeholder.com/32'}">
      </div>`;
  }

  remove = () => {
    this.element.remove();
  }

  destroy = () => {
    this.element.remove();
    this.subElements = {};
  }
}
