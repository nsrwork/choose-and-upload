export class Form {
  constructor ({ el, onSubmit }) {
    this.el = el
    this.multiple = false

    this.el.addEventListener('click', () => {
      document.querySelector('#uploadFile').click()
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
        style="display:none" 
        type="file" 
        name="files[]" 
        id="uploadFile" 
        accept="${this.accept}"
        ${this.multiple}
      >
      <button name="uploadButton" class="uploadButton">+</button>      
    `
  }

  _onSubmit (event) {
    event.preventDefault()
    this.onSubmit({
      files: event.target.files,
    })
  }
}