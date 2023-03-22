import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;

  constructor ({url = '', range = {}, label = '', link = '', formatHeading = val => val} = {}) {
    this.url = url;
    this.label = label;
    this.range = range;
    this.link = link;
    this.formatHeading = formatHeading;
    this.data = [];
    this.render();
    this.getSubElements();
    this.update(range.from, range.to);
  }

  template() {

    const anotherLink = this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';

    return `<div class="column-chart" style="--chart-height: 50">
              <div class="column-chart__title">
                Total ${this.label}
                ${anotherLink}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header"></div>
                <div data-element="body" class="column-chart__chart"></div>
              </div>
            </div>`;
  }

  render() {

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template();

    this.element = wrapper.firstElementChild;
  }

  getSubElements() {
    const result = {};

    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      const name = element.dataset.element;
      result[name] = element;
    }

    this.subElements = result;
  }

  async loadData(from, to) {
    this.element.classList.add('column-chart_loading');

    const url = `https://course-js.javascript.ru/${this.url}?from=${from.toISOString()}&to=${to.toISOString()}`;
    try {
      let getFetch = await fetch(url);
      this.data = await getFetch.json();
    } catch (e) {
      console.log(e);
    }

    this.element.classList.remove('column-chart_loading');
  }

  async update(from, to) {
    await this.loadData(from, to);

    this.subElements.body.innerHTML = `
      ${this.getColumnProps().map(item => `
         <div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`).join('')}
      `;

    this.updateValue();

    return this.data;
  }

  updateValue() {
    this.subElements.header.innerHTML = `${this.result.reduce((sum, a) => sum + a, 0)}`;
  }

  getColumnProps() {
    this.result = [];

    for (let value of Object.values((this.data))) {
      this.result.push(value);
    }

    const maxValue = Math.max(...this.result);
    const scale = this.chartHeight / maxValue;

    return this.result.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.chartHeight = null;
  }
}
