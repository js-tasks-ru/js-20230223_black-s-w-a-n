export default class NotificationMessage {
  subElement = {};
  constructor(title = '', {duration = 1000, type = 'success'} = {}) {
    this.title = title;
    this.duration = duration;
    this.type = type;
    this.render();
    this.getNotification();
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
    if (this.subElement.notification) {
      this.subElement.notification.remove();
      clearTimeout(window.timerId);
    }
    target.append(this.element);
    window.timerId = setTimeout(() => this.remove(), this.duration);
  }

  getNotification() {
    this.subElement.notification = document.querySelector('.notification');
  }

  remove = () => {
    this.element.remove();
  }

  destroy = () => {
    this.remove();
  }
}
