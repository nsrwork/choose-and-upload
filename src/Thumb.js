export class Thumb {
  constructor ({ el, previewTemplate, loaderTemplate, failTemplate }) {
    this.el = el
    this.src = ''
    this.href = '#'
    this.rank = 0
    this.previewTemplate = previewTemplate
    this.loaderTemplate = loaderTemplate
    this.failTemplate = failTemplate
  }

  setRank (rank) {
    this.rank = rank
  }

  setHref (href) {
    this.href = href
  }

  setSrc (src) {
    this.src = src
  }

  addPreview () {
    let template = document.createElement('div')
    template.innerHTML = this.previewTemplate

    if (template.querySelector('.js-pool-preview__link')) {
      template.querySelector('.js-pool-preview__link').setAttribute('href', this.href)
    }

    if (template.querySelector('.js-pool-preview__rank')) {
      template.querySelector('.js-pool-preview__rank').innerText = this.rank
    }

    if (template.querySelector('.js-pool-preview__img')) {
      template.querySelector('.js-pool-preview__img').setAttribute('src', this.src)
    }

    this.el.querySelector('.js-pool-loader').remove()
    this.el.append(template.firstElementChild)
  }

  addLoader () {
    let template = document.createElement('div')
    template.innerHTML = this.loaderTemplate
    this.el.append(template.firstElementChild)
  }

  addFail () {
    let template = document.createElement('div')
    template.innerHTML = this.failTemplate
    this.el.append(template.firstElementChild)
  }
}