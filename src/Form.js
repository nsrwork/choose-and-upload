export class Form {
  constructor ({ el, onSubmit }) {
    this.el = el
    this.multiple = false

    this.el.addEventListener('click', () => {
      document.querySelector('.js-pool-loader').click()
    })

    this.el.addEventListener('change', this._onSubmit.bind(this))
    this.onSubmit = onSubmit
  }

  setAccept (array) {
    this.accept = String(array)
  }

  setLimit (int) {
    this.multiple = int > 1 ? 'multiple' : ''
  }

  render () {
    this.el.innerHTML = `
      <input 
        style="visibility: hidden; position: absolute; top: 0px; left: 0px; height: 0px; width: 0px;" 
        type="file" 
        name="files[]" 
        class="js-pool-loader"
        accept="${this.accept}"
        ${this.multiple}
      >
      <button type="button" name="poolBtn" class="js-pool-btn">+ Выберите фото для загрузки</button>      
    `
  }

  _onSubmit (event) {
    event.preventDefault()
    this.onSubmit(event.target.files)
  }
}