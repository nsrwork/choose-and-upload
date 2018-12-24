export class FlashMessage {
  constructor ({ el }) {
    this.el = el
    this.alert = document.createElement('div')
  }

  add (message) {
    this.alert.innerHTML = `
    <div class="alert alert-danger" role="alert">${message}</div>
    `
    this.el.append(this.alert.firstElementChild)
  }
}