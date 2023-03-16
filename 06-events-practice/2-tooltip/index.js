class Tooltip {

  static onlyInstance;

  element;

  constructor() {
    if (!Tooltip.onlyInstance) {
      Tooltip.onlyInstance = this;
    } else {
      return Tooltip.onlyInstance;
    }
  }

  initialize() {
    document.body.addEventListener('pointerover', this.handler);

    document.body.addEventListener('pointerout', this.remove);
  }

  render (closestEl) {
    if (!closestEl) {
      closestEl = document.createElement('div');
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${closestEl.dataset.tooltip}</div>`;
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  handler = (event) => {
    const closestElement = event.target.closest('[data-tooltip]');
    this.render(closestElement);
    document.body.addEventListener('pointermove', this.positioning);
  }

  positioning = (event) => {
    this.element.style.left = `${(event.clientX / 10) - 5}%`;
    this.element.style.top = `${(event.clientY / 10 + 5)}%`;
  }

  remove = () => {
    if (this.element) {
      this.element.remove();
      Tooltip.onlyInstance = null;
      document.body.removeEventListener('pointermove', this.positioning);
    }
  }

  destroy = () => {
    this.remove();
    document.body.removeEventListener('pointerover', this.handler);
    document.body.removeEventListener('pointerout', this.remove);
  }
}

export default Tooltip;
