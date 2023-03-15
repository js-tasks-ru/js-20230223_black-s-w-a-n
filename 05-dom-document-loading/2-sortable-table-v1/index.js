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
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerTemplate()}
          </div>
          <div data-element="body" class="sortable-table__body">
           ${this.dataTemplate(tableData)}
           </div>
        </div>`;
  }

  headerTemplate() {
    return `${this.header.map(item => `
               <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="">
                   <span>${item.title}</span>
                   <span data-element="arrow" class="sortable-table__sort-arrow">
                      <span class="sort-arrow"></span>
                   </span>
               </div>`).join('')}`;
  }

  dataTemplate() {
    return `${this.data.map(item => `
              <a href="${item.id}" class="sortable-table__row">
                ${this.getRows(item)}
              </a>`).join('')}`;
  }

  getRows(item) {
    return this.header.map(value => {
      if (value.template) {
        return value.template(item);
      }
      return ` <div class="sortable-table__cell">${item[value.id]}</div>`;
    }).join('');
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
    const column = this.header.find(item => item.id === fieldValue);
    const sortType = column.sortType;

    if (sortType === 'string') {
      orderValue === 'asc' ? this.data.sort((a, b) => a[fieldValue].localeCompare(b[fieldValue], 'ru', { sensitivity: 'base' })) : this.data.sort((a, b) => b[fieldValue].localeCompare(a[fieldValue], 'ru', { sensitivity: 'base' }));
    } else {
      orderValue === 'asc' ? this.data.sort((a, b) => a[fieldValue] - b[fieldValue]) : this.data.sort((a, b) => b[fieldValue] - a[fieldValue]);
    }
    this.update();
  }

  update() {
    this.subElements.body.innerHTML = this.dataTemplate();
  }

  remove = () => {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
