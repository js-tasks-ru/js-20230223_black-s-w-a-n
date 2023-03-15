export default class SortableTable {

  element;
  subElements;
  lastEvent;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

    this.header = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();
    this.eventListeners();
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

  dataTemplate(data = this.data) {
    return `${data.map(item => `
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

    this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }
    this.subElements = result;

    this.setDefault(elements);
  }

  setDefault(elements) {
    for (const element of elements) {
      if (element.parentElement.dataset.id === this.sorted.id) {
        element.parentElement.dataset.order = this.sorted.order;
        this.lastEvent = element.parentElement;
      }
    }
    this.sort(this.sorted.order, this.sorted.id);
  }

  eventListeners = () => {

    this.subElements.header.addEventListener('pointerdown', (event) => {
      const columnType = event.target.dataset.id;

      if (!this.checkColumnType(columnType).sortable) {
        return;
      }

      if (this.lastEvent === event.target) {
        event.target.dataset.order === 'asc' ? event.target.dataset.order = 'desc' : event.target.dataset.order = 'asc';

      } else {
        this.lastEvent.dataset.order = '';
        event.target.dataset.order = 'asc';
      }

      this.lastEvent = event.target;
      const order = event.target.dataset.order;

      this.sort(order, columnType);
    });
  }

  sort(order, columnType) {
    let data = [...this.data];

    const column = this.checkColumnType(columnType);
    const sortType = column.sortType;

    if (sortType === 'string') {
      order === 'asc' ? data.sort((a, b) => a[columnType].localeCompare(b[columnType], 'ru', { sensitivity: 'base' })) : data.sort((a, b) => b[columnType].localeCompare(a[columnType], 'ru', { sensitivity: 'base' }));
    } else {
      order === 'asc' ? data.sort((a, b) => a[columnType] - b[columnType]) : data.sort((a, b) => b[columnType] - a[columnType]);
    }
    this.update(data);
  }

  checkColumnType(columnType) {
    return this.header.find(item => item.id === columnType);
  }

  update(data) {
    this.subElements.body.innerHTML = this.dataTemplate(data);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.lastEvent = null;
    this.subElements = {};
  }
}
