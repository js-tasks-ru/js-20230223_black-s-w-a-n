export default class DoubleSlider {
  element;
  subElements = {};
  leftShift;
  rightShift;

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max
    }} = {}) {

    this.min = min;
    this.max = max;
    this.range = max - min;
    this.formatValue = formatValue;
    this.selected = selected;
    this.minPrice = selected.from;
    this.maxPrice = selected.to;
    this.leftShift = this.selected.from - this.min;
    this.rightShift = this.max - this.selected.to;
    this.render();
    this.getSubElements();
    this.initialEventListeners();

  }
  template() {

    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: ${this.selected.from - this.min}%; right: ${this.max - this.selected.to}%"></span>
          <span class="range-slider__thumb-left" style="left: ${this.selected.from - this.min}%"></span>
          <span class="range-slider__thumb-right" style="right: ${this.max - this.selected.to}%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>`;
  }

  render() {

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template();
    this.element = wrapper;
  }

  getSubElements() {

    const result = {};
    result.rangerSlideInner = this.element.querySelector('.range-slider__inner');
    result.thumbLeft = this.element.querySelector('.range-slider__thumb-left');
    result.thumbRight = this.element.querySelector('.range-slider__thumb-right');
    result.rangeSlider = this.element.querySelector('.range-slider');
    result.progress = this.element.querySelector('.range-slider__progress');
    this.subElements = result;
  }

  initialEventListeners() {

    this.subElements.rangerSlideInner.addEventListener('pointerdown', this.innerEventListeners);
  }

  innerEventListeners = (event) => {
    if (event.target.className === 'range-slider__thumb-left') {
      document.addEventListener('pointermove', this.thumbLeft);
      document.addEventListener('pointerup', this.removeThumbLeft);
      this.subElements.thumbLeft.classList.add('range-slider_dragging');

    } else if (event.target.className === 'range-slider__thumb-right') {
      document.addEventListener('pointermove', this.thumbRight);
      document.addEventListener('pointerup', this.removeThumbRight);
      this.subElements.thumbRight.classList.add('range-slider_dragging');
    }
  }

  thumbLeft = (event) => {

    const sliderLength = this.subElements.rangerSlideInner.getBoundingClientRect().right - this.subElements.rangerSlideInner.getBoundingClientRect().left;
    this.leftShift = Math.round((event.clientX - this.subElements.rangerSlideInner.getBoundingClientRect().left) / (sliderLength / this.range));

    if (this.leftShift < 0) {
      return;
    } else if (this.leftShift > 100) {
      return;
    } else if (this.leftShift >  this.rightShift) {
      return;
    } else {
      this.subElements.thumbLeft.style.left = `${this.leftShift}%`;
      this.subElements.progress.style.left = `${this.leftShift}%`;
    }

    this.minPrice = this.leftShift + this.min;
    this.subElements.rangeSlider.firstElementChild.textContent = `${this.formatValue(this.minPrice)}`;
  }

  thumbRight = (event) => {

    const sliderLength = this.subElements.rangerSlideInner.getBoundingClientRect().right - this.subElements.rangerSlideInner.getBoundingClientRect().left;
    this.rightShift = Math.round((event.clientX - this.subElements.rangerSlideInner.getBoundingClientRect().left) / (sliderLength / this.range));

    if (this.rightShift < this.leftShift) {
      return;
    } else if (this.rightShift > 100) {
      return;
    } else if (this.rightShift < 0) {
      return;
    } else {
      this.subElements.thumbRight.style.left = `${this.rightShift}%`;
      this.subElements.progress.style.right = `${100 - this.rightShift}%`;
    }

    this.maxPrice = this.rightShift + this.min;
    this.subElements.rangeSlider.lastElementChild.textContent = `${this.formatValue(this.maxPrice)}`;
  }

  removeThumbLeft = () => {

    this.subElements.thumbLeft.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.thumbLeft);
    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubbles: true,
      detail: this.getDetail(),
    }));
  }

  removeThumbRight = () => {

    this.subElements.thumbRight.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.thumbRight);
    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubbles: true,
      detail: this.getDetail(),
    }));
  }

  getDetail() {
    const from = this.minPrice;
    const to = this.maxPrice;
    return {from, to};
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {

    this.remove();
    document.removeEventListener('pointerup', this.removeThumbLeft);
    document.removeEventListener('pointerup', this.removeThumbRight);
  }
}
