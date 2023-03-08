export default class ColumnChart {
  chartHeight = 50;

  constructor ({data = [], label = '', value = 0, link = '', formatHeading = val => val} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  render() {
    let skeleton;
    let anotherLink = '';

    if (this.data.length === 0) {
      skeleton = 'column-chart_loading';
    }

    if (this.link) {
      anotherLink = `<a class="column-chart__link" href="${this.link}">View all</a>`;
    }

    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
          <div class="column-chart ${skeleton}" style="--chart-height: 50">
            <div class="column-chart__title">
              Total ${this.label}
              ${anotherLink}
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
              <div data-element="body" class="column-chart__chart">
                ${this.getColumnProps(this.data).map(item => `
                  <div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>
                `).join('')}
              </div>
            </div>
          </div>`;

    this.element = wrapper.firstElementChild;
  }

  update(newData) {
    const updatedElement = document.querySelector('.column-chart__chart');
    updatedElement.innerHTML = `
      ${this.getColumnProps(newData).map(item => `
         <div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`).join('')}
      `;
  }

  destroy() {
    this.element = null;
  }

  remove() {
    this.element.remove();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
}
