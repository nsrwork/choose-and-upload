export class Thumb {
  constructor ({ el }) {
    this.el = el
    this.thumbItem = document.createElement('div')
    this.src = 'loader.gif'
    this.href = ''
  }

  setHref (href) {
    this.href = href
  }

  setSrc (src) {
    this.src = src
  }

  addLoader () {
    this.thumbItem.innerHTML = `
    <div class="item item_loader">
        <img src="${this.src}" alt="">
    </div>
    `
    this.el.append(this.thumbItem.firstElementChild)
  }

  addThumb () {
    this.thumbItem.innerHTML = `
    <div class="item">
        <a href="${this.href}">
            <img src="${this.src}" alt="">
        </a>
    </div>
    `
    this.el.querySelector('.item_loader').remove()
    this.el.append(this.thumbItem.firstElementChild)
  }

  addError () {
    this.thumbItem.innerHTML = `
    <div class="item">
        <img src="${this.src}" alt="">
    </div>
    `
    this.el.querySelector('.item_loader').remove()
    this.el.append(this.thumbItem.firstElementChild)
  }
}