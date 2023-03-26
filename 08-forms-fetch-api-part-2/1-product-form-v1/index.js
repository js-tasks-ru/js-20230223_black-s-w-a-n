import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  element;

  subElements = {};
  defaultFormData = [{
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  }];
  constructor (productId) {
    this.productId = '';
  }

  template(data) {

    return `
          <div class="product-form">
            <form data-element="productForm" class="form-grid">
              ${this.nameForm(data[0].title)}
              ${this.descriptionForm(data[0].description)}
              ${this.photoForm(data[0].images)}
              ${this.categoryForm(data[0].categories)}
              ${this.priceForm(data[0].price, data[0].discount)}
              ${this.quantityForm(data[0].quantity)}
              ${this.statusForm(data[0].status)}
              <div class="form-buttons">
                <button type="submit" name="save" data-element="save" class="button-primary-outline">
                  Сохранить товар
                </button>
              </div>
            </form>
          </div>`;
  }

  nameForm(title) {

    return `
            <div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input required="" type="text" name="title" value="${title}" class="form-control" placeholder="Название товара">
              </fieldset>
            </div>`;
  }

  descriptionForm(description) {

    return `
            <div class="form-group form-group__wide">
              <label class="form-label">Описание товара</label>
              <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${description}</textarea>
            </div>`;
  }

  photoForm(images = []) {

    return `
            <div class="form-group form-group__wide" data-element="sortable-list-container">
                <label class="form-label">Фото</label>
                    <div data-element="imageListContainer">
                      <ul class="sortable-list">
                            ${images.map(item => `<li class="products-edit__imagelist-item sortable-list__item" style="">
                            <input type="hidden" name="url" value="${item.url}">
                            <input type="hidden" name="source" value="${item.source}">
                            <span>
                              <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                              <img class="sortable-table__cell-img" alt="${escapeHtml(item.source)}" src="${escapeHtml(item.url)}">
                              <span>${escapeHtml(item.source)}</span>
                            </span>
                            <button type="button">
                              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                            </button>
                          </li>`).join('')}
                      </ul>
                    </div>
                    <span>
                        <input id="file-input" data-element="saveImage" type="file" name="file" style="visibility: hidden">
                        <label for="file-input" class="button-primary-outline">Загрузить</label>
                    </span>
                </div>`;
  }

  categoryForm() {

    return `
            <div class="form-group form-group__half_left">
                <label class="form-label">Категория</label>
                <select class="form-control" name="subcategory">
                 ${this.categories.map(category =>
                        category.subcategories.map(subcategory => `
                                <option value="${category.id}">${category.title} &gt; ${subcategory.title}</option>`))}
                </select>
            </div>`;
  }

  priceForm(price, discount) {

    return `
            <div class="form-group form-group__half_left form-group__two-col">
                <fieldset>
                  <label class="form-label">Цена ($)</label>
                  <input required="" type="number" name="price" value="${price}" class="form-control" placeholder="100">
                </fieldset>
                <fieldset>
                  <label class="form-label">Скидка ($)</label>
                  <input required="" type="number" name="discount" value="${discount}" class="form-control" placeholder="0">
                </fieldset>
            </div>`;
  }

  quantityForm(quantity) {

    return `
            <div class="form-group form-group__part-half">
                <label class="form-label">Количество</label>
                <input required="" type="number" value="${quantity}" class="form-control" name="quantity" placeholder="1">
            </div>`;
  }

  statusForm(status) {

    if (status) {

      return `
            <div class="form-group form-group__part-half">
                <label class="form-label">Статус</label>
                <select class="form-control" name="status">
                  <option value="1" selected>Активен</option>
                  <option value="0">Неактивен</option>
                </select>
            </div>`;
    }

    return `
            <div class="form-group form-group__part-half">
                <label class="form-label">Статус</label>
                <select class="form-control" name="status">
                  <option value="1">Активен</option>
                  <option value="0" selected >Неактивен</option>
                </select>
            </div>`;
  }

  async loadCategory() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    this.categories = await fetchJson(url);
  }

  async loadProducts() {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.set('id', `${this.productId}`);

    return await fetchJson(url);
  }

  async render() {
    const wrapper = document.createElement('div');

    await this.loadCategory();

    if (this.productId) {

      const productData = await this.loadProducts();

      wrapper.innerHTML = this.template(productData);
      this.element = wrapper.firstElementChild;

    } else {
      wrapper.innerHTML = this.template(this.defaultFormData);
      this.element = wrapper.firstElementChild;
    }

    this.getSubElements();
    this.addEventListenerForCreating();
    this.addEventListenerForEditing();
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

  addEventListenerForCreating() {
    this.subElements.saveImage.addEventListener('change', async () => {

      try {
        const [file] = this.subElements.saveImage.files;
        const result = await this.imageList(file);

        this.renderImages(result);

      } catch (e) {
        console.log(e);
      }
    });
  }

  imageList = async (file) => {

    const data = new FormData();
    data.append('image', file);

    const url = new URL('3/image', 'https://api.imgur.com');

    try {
      return await fetchJson(url, {
        method: 'POST',
        headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}`},
        body: data,
        referrer: ''
      });

    } catch (e) {
      return Promise.reject(e);
    }
  }

  renderImages(image) {

    this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML("beforeEnd", `<li class="products-edit__imagelist-item sortable-list__item" style="">
                                                                                        <input type="hidden" name="url" value="${image.data.link}">
                                                                                        <input type="hidden" name="source" value="${image.data.id}">
                                                                                        <span>
                                                                                          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                                                                                          <img class="sortable-table__cell-img" alt="Image" src="${image.data.link}">
                                                                                          <span>${image.data.id}</span>
                                                                                        </span>
                                                                                        <button type="button">
                                                                                          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                                                                                        </button>
                                                                                      </li>`);

  }

  addEventListenerForEditing() {
    this.subElements.productForm.addEventListener('submit', this.save);
  }

  save = async (event) => {

    event.preventDefault();

    const data = new FormData(this.subElements.productForm);

    await this.sendData(data);
  }

  async sendData(data) {
    const url = new URL('api/rest/products', BACKEND_URL);

    try {
      return await fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: data,
      });

    } catch (e) {
      return Promise.reject(e);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
