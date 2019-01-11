export class Alert {
  constructor ({ el, alertTemplate }) {
    this.el = el
    this.alertTemplate = alertTemplate
    this.danger = '';
  }

  setDanger (message) {
    this.danger = message
  }

  add () {
    let template = document.createElement('div')
    template.innerHTML = this.alertTemplate

    if (template.querySelector('.js-pool-alert')) {
      template.querySelector('.js-pool-alert').innerText = this.danger
    }

    this.el.append(template.firstElementChild)
  }
}