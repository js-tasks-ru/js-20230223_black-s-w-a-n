import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  element;
  subElements = {};
  products = [];

  constructor(headersConfig = [], {
    url = '',
    sorted = {id: headersConfig.find(item => item.sortable).id,
      order: 'asc'},
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {

    this.header = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sortLocally = isSortLocally;
    this.sorted = sorted;
    this.step = step;
    this.start = start;
    this.end = end;
    this.render();
    this.getSubElements();
    this.eventListeners();
    this.update(sorted.id, sorted.order);
  }

  sortOnClient (id, order) {

    const column = this.checkColumnType(id);
    const sortType = column.sortType;

    if (sortType === 'string') {
      order === 'asc' ? this.products.sort((a, b) => a[id].localeCompare(b[id], 'ru')) : this.products.sort((a, b) => b[id].localeCompare(a[id], 'ru'));
    } else {
      order === 'asc' ? this.products.sort((a, b) => a[id] - b[id]) : this.products.sort((a, b) => b[id] - a[id]);
    }

    this.subElements.body.innerHTML = this.dataTemplate(this.products);
  }

  sortOnServer (id, order) {
    this.update(id, order);
  }

  template() {
    return `
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerTemplate()}
          </div>
          <div data-element="body" class="sortable-table__body">
           ${this.dataTemplate(this.products)}
           </div>

           <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
           <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
             <div>
               <p>No products satisfies your filter criteria</p>
               <button type="button" class="button-primary-outline">Reset all filters</button>
             </div>
           </div>

        </div>`;
  }

  headerTemplate() {
    return `${this.header.map(item => this.headerRow(item)).join('')}`;
  }

  headerRow(item) {

    if (this.sorted.id === item.id) {

      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${this.sorted.order}">
          <span>${item.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>`;
    }

    return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" >
          <span>${item.title}</span>
        </div>`;
  }

  dataTemplate(result) {
    if (result) {

      return `${result.map(item => `
              <a href="${item.id}" class="sortable-table__row">
                ${this.getRows(item)}
              </a>`).join('')}`;
    }
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
    wrapper.innerHTML = this.template();
    this.element = wrapper.firstElementChild;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }
    this.subElements = result;
  }
  eventListeners = () => {

    window.addEventListener('scroll', this.infinityScroll);

    this.subElements.header.addEventListener('pointerdown', (event) => {

      if (!this.checkColumnType(event.target.dataset.id).sortable) {
        return;
      }

      event.target.dataset.order === 'desc' ? event.target.dataset.order = 'asc' : event.target.dataset.order = 'desc';
      event.target.append(this.subElements.arrow);

      this.id = event.target.dataset.id;
      this.order = event.target.dataset.order;

      if (this.sortLocally) {
        this.sortOnClient(this.id, this.order);
        return;
      }

      this.sortOnServer(this.id, this.order);
    });
  }

  checkColumnType(columnType) {
    return this.header.find(item => item.id === columnType);
  }

  infinityScroll = async () => {

    let bottom = document.documentElement.getBoundingClientRect().bottom;

    if ((!this.sortLocally) && (!this.isLoaiding) && (bottom <= document.documentElement.clientHeight)) {

      this.start = this.end;
      this.end = this.start + this.step;

      this.isLoaiding = true;

      await this.loadData(this.id, this.order, this.start, this.end);

      this.isLoaiding = false;
      this.subElements.body.insertAdjacentHTML("beforeend", this.dataTemplate(this.products));
    }
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    try {
      this.products = await fetchJson(this.url);
    } catch (e) {
      console.log(e);
    }

    if (this.products.length) {
      this.subElements.emptyPlaceholder.classList.remove("sortable-table__empty-placeholder");
    }
  }

  async update(id, order) {

    this.element.classList.add("sortable-table_loading");

    await this.loadData(id, order);

    this.element.classList.remove("sortable-table_loading");

    this.subElements.body.innerHTML = this.dataTemplate(this.products);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.products = [];
    this.subElements = {};
    this.value = null;
    window.removeEventListener('scroll', this.infinityScroll);
  }
}
