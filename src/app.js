const APPLICATION = 'choose-and-upload'

const ALERT = APPLICATION + '-alerts'

const BUTTON = APPLICATION + '-button'
const BUTTON_STATE_READY = BUTTON + '-state-ready'
const BUTTON_STATE_LOADING = BUTTON + '-state-loading'
const BUTTON_STATE_ERROR = BUTTON + '-state-error'

const THUMB = APPLICATION + '-thumb'
const THUMB_STATE_LOADING = THUMB + '-state-loading'
const THUMB_STATE_SUCCESS = THUMB + '-state-success'
const THUMB_STATE_ERROR = THUMB + '-state-error'

const EVENT = APPLICATION + '-event'
const EVENT_START = EVENT + '-start'
const EVENT_VALIDATION_FAIL = EVENT + '-validation-fail'
const EVENT_LOAD_FAIL = EVENT + '-load-fail'
const EVENT_LOAD_SUCCESS = EVENT + '-load-success'

const defaultConf = {

  /**
   * FormComponent configuration
   */

  /**
   * Validation configuration
   */
  filesAccept: ['image/jpeg', 'image/png'],
  filesLimit: 100,
  fileMaxSize: 10,

  /**
   * HttpService configuration
   */
  methodRequest: 'POST',
  endPoint: '/',

}

class HelperUtil {

  /**
   * @type {string}
   * @param template
   * @returns {ChildNode}
   */
  static createHTML (template) {
    let node = document.createElement('div')
    node.innerHTML = template.trim()

    return node.firstChild
  }
}

class ButtonComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_START, () => this.loading())
    this.el.addEventListener(EVENT_LOAD_SUCCESS, () => this.ready())
    this.el.addEventListener(EVENT_LOAD_FAIL, () => this.error())
    this.el.addEventListener(EVENT_VALIDATION_FAIL, () => this.ready())
  }

  isDisable () {
    return this._button.disabled
  }

  render () {
    this.el.append(HelperUtil.createHTML(this.template()))
    this._button = this.el.querySelector('button')
    this.ready()
  }

  ready () {
    this.state = BUTTON_STATE_READY
    this._button.disabled = false
  }

  loading () {
    this.state = BUTTON_STATE_LOADING
    this._button.disabled = true
  }

  error () {
    this.state = BUTTON_STATE_ERROR
    this._button.disabled = true
  }

  set state (state) {
    if (BUTTON_STATE_LOADING === state) {
      this._button.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Загрузка...`
    }

    if (BUTTON_STATE_ERROR === state) {
      this._button.innerHTML = 'Произошла ошибка, попробуйте позже.'
    }

    if (BUTTON_STATE_READY === state) {
      this._button.textContent = 'Выберите фото для загрузки'
    }
  }

  template () {
    return `
        <div class="choose-and-upload__button">
            <button type="button" class="btn btn-primary ${BUTTON}"></button>
        </div>
        `
  }
}

class FormComponent {
  constructor ({ el }) {
    this.el = el
  }

  set filesAccept (extensions) {
    this._accept = String(extensions)
  }

  set multiple (limit) {
    this._multiple = limit > 1 ? 'multiple' : ''
  }

  render () {
    this.el.append(HelperUtil.createHTML(
      `<input 
        style="visibility: hidden; position: absolute; top: 0; left: 0; height: 0; width: 0;" 
        type="file" 
        name="files[]"
        accept="${this._accept}"
        ${this._multiple}
      >`))
  }
}

class AlertComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_VALIDATION_FAIL, this)
    this.el.addEventListener(EVENT_LOAD_FAIL, this)
  }

  init () {
    this.el.append(HelperUtil.createHTML(`<div class="${ALERT}"></div>`))
    this._alerts = this.el.querySelector('.' + ALERT)
  }

  handleEvent (event) {
    console.log(event)
    this._alerts.append(HelperUtil.createHTML(this.template()))
    this._alert = this._alerts.querySelectorAll('.alert:last-child')
    this._alert[0].append(event.detail)
  }

  template () {
    return `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `
  }
}

class ThumbComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_START, () => this.loading())
    this.el.addEventListener(EVENT_VALIDATION_FAIL, () => this.state = THUMB_STATE_ERROR)
    this.el.addEventListener(EVENT_LOAD_SUCCESS, () => this.state = THUMB_STATE_SUCCESS)
    this.el.addEventListener(EVENT_LOAD_FAIL, () => this.state = THUMB_STATE_ERROR)
  }

  init () {
    this.el.append(HelperUtil.createHTML(`<div class="card-deck"></div>`))
    this._deck = this.el.querySelector('.card-deck')
  }

  loading () {
    this.state = BUTTON_STATE_LOADING

    this._deck.append(HelperUtil.createHTML(`<div class="card border"></div>`))
    this._thumb = this._deck.querySelector('.card:last-child')
  }

  set state (state) {
    if (THUMB_STATE_LOADING === state) {
      this._thumb.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`
    }

    if (THUMB_STATE_ERROR === state) {
      this._thumb.innerHTML = `<span aria-hidden="true">&times;</span>`
    }

    if (THUMB_STATE_SUCCESS === state) {
      this._thumb.innerHTML = `<img src="https://via.placeholder.com/150" class="card-img-top" alt="...">`
    }
  }
}

class ValidationService {
  set filesAccept (extensions) {
    this._accept = extensions
  }

  set fileMaxSize (sizeAsMb) {
    this._size = sizeAsMb * 1024 * 1024
  }

  set filesLimit (limit) {
    this._limit = limit
  }

  get errors () {
    return this._errors
  }

  /**
   * @param file {File}
   */
  isValid (file) {

    this._errors = []

    if (!file instanceof File) {
      throw new TypeError('Не корретный тип.')
    }

    if (this._limit <= 0) {
      this._errors.push('Превышен лимит на загрузку.')
    }

    if (!this._accept.includes(file.type)) {
      this._errors.push(`Формат файла "${file.name}" отличается от разрешенных: ${String(this._accept)}.`)
    }

    if (file.size > this._size) {
      this._errors.push(`Размер файла "${file.name}" превышает разрешенный лимит в ${(this._size / 1024 / 1024)} Мб.`)
    }

    if (this._errors.length !== 0) {
      return false
    }

    if (this._limit > 0) {
      this._limit--
    }

    return true
  }
}

class HttpService {
  constructor ({ el }) {
    this.el = el
  }

  set endpoint (url) {
    this._url = url
  }

  set method (method) {
    this._method = method.toUpperCase()
  }

  set data (data) {
    this._data = data
  }

  send () {
    this.doRequest().then((response) => {
      if (response.ok) {
        this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_SUCCESS, { detail: response.status }))
      } else {
        this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_FAIL, { detail: response.statusText }))
      }
    }).catch((response) => {
      this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_FAIL, { detail: response }))
    })
  }

  async doRequest () {
    return await fetch(this._url, {
      method: this._method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8;multipart/form-data',
      },
      body: JSON.stringify(this._data)
    })
  }
}

export class App {
  constructor ({ el, conf = {} }) {

    if (null === document.querySelector(el)) {
      throw new Error('Не найден элемент для инициализации ChooseAndUpload')
    }

    this.el = el
    this.conf = Object.assign(defaultConf, conf)

    this.el = document.querySelector(this.el)

    // инициализация блока сообщений
    this.alert = new AlertComponent({ el: this.el })
    this.alert.init()

    // отрисовываем кнопку
    this.button = new ButtonComponent({ el: this.el })
    this.button.render()

    // настраиваем и отрисовываем скрытую форму
    this.form = new FormComponent({ el: this.el })
    this.form.filesAccept = this.conf.filesAccept
    this.form.multiple = this.conf.filesLimit
    this.form.render()

    // настраиваем параметры валидации
    this.validation = new ValidationService()
    this.validation.filesAccept = this.conf.filesAccept
    this.validation.filesLimit = this.conf.filesLimit
    this.validation.fileMaxSize = this.conf.fileMaxSize

    // настраиваем параметры http запроса
    this.http = new HttpService({ el: this.el })
    this.http.endpoint = this.conf.endPoint
    this.http.method = this.conf.methodRequest

    // инициализируем объект сообщений
    this.alert = new AlertComponent({ el: this.el })

    // инициализируем болванку
    this.thumb = new ThumbComponent({ el: this.el })
    this.thumb.init()

    this.el.addEventListener('click', this.onClick.bind(this))
    this.el.addEventListener('change', this.onChange.bind(this))
  }

  onClick (event) {
    if (event.target.classList.contains(BUTTON) && !this.button.isDisable()) {
      this.el.querySelector('input').click()
    }
  }

  onChange (event) {
    if (event.target.files.length <= 0) {
      this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_FAIL, { detail: 'Не выбрано ни одного файла' }))
      return
    }

    const collection = new Set(event.target.files)

    this.el.dispatchEvent(new Event(EVENT_START))

    for (let file of collection.values()) {

      if (!this.validation.isValid(file)) {
        this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_FAIL, { detail: this.validation.errors[0] }))
        continue
      }

      this.http.data = file
      this.http.send()
    }

    collection.clear()
  }
}