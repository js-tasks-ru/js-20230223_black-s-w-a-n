export default class NotificationMessage {
  subElement = {};
  constructor(title = '', {duration = 1000, type = 'success'} = {}) {
    this.title = title;
    this.duration = duration;
    this.type = type;
    this.render();
    this.getButton();
  }

  template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.title}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template();
    this.element = wrapper.firstElementChild;
  }

  show(target = document.body) {
    const notificationEl = document.querySelector('.notification');
    if (notificationEl) {
      notificationEl.remove();
      clearTimeout(window.timerId);
    }
    target.append(this.element);
    window.timerId = setTimeout(() => this.remove(), this.duration);
  }

  getButton() {
    this.subElement.button = document.querySelector('#btn1');
  }

  remove = () => {
    this.element.remove();
  }

  destroy = () => {
    this.remove();
  }
}
