const APPLICATION = 'choose-and-upload'

const ALERT = APPLICATION + '-alerts'

const BUTTON = APPLICATION + '-button'
const BUTTON_STATE_READY = BUTTON + '-state-ready'
const BUTTON_STATE_LOADING = BUTTON + '-state-loading'
const BUTTON_STATE_ERROR = BUTTON + '-state-error'

const CARD = APPLICATION + '-card'
const CARD_STATE_LOADING = CARD + '-state-loading'
const CARD_STATE_SUCCESS = CARD + '-state-success'
const CARD_STATE_ERROR = CARD + '-state-error'

const EVENT = APPLICATION + '-event'
const EVENT_VALIDATION_START = EVENT + '-start'
const EVENT_VALIDATION_FAIL = EVENT + '-validation-fail'
const EVENT_LOAD_FAIL = EVENT + '-load-fail'
const EVENT_LOAD_SUCCESS = EVENT + '-load-success'

const defaultConf = {

  /**
   * FormComponent configuration
   */

  /**
   * AlertComponent configuration
   */

  /**
   * ButtonComponent configuration
   */

  /**
   * CardComponent configuration
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
  endPoint: window.location.href,
  headers: {}
}

export class HelperUtil {

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

  static getUniqId () {
    return 'ID' + Math.random().toString(36).substr(2, 16)
  }
}

export class ButtonComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_VALIDATION_START, () => this.loading())
    this.el.addEventListener(EVENT_LOAD_SUCCESS, () => this.ready())
    this.el.addEventListener(EVENT_LOAD_FAIL, () => this.error())
    this.el.addEventListener(EVENT_VALIDATION_FAIL, () => this.ready())
  }

  isDisable () {
    return this._button.disabled
  }

  render () {
    this.el.append(HelperUtil.createHTML(this.template()))
    this._button = this.el.querySelector(`.${BUTTON}__button`)
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
        <div class="${BUTTON}__group">
            <button type="button" class="btn ${BUTTON}__button"></button>
        </div>
        `
  }
}

export class FormComponent {
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

export class AlertComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_VALIDATION_FAIL, this)
    this.el.addEventListener(EVENT_LOAD_FAIL, this)
  }

  init () {
    this.el.append(HelperUtil.createHTML(`<div class="${ALERT}__group"></div>`))
    this._alerts = this.el.querySelector(`.${ALERT}__group`)
  }

  handleEvent (event) {
    this._alerts.append(HelperUtil.createHTML(this.template()))
    this._alert = this._alerts.querySelectorAll(`.${ALERT}__alert:last-child`)
    this._alert[0].append(event.detail.error)
  }

  template () {
    return `<div class="alert alert-warning alert-dismissible fade show ${ALERT}__alert" role="alert"></div>`
  }
}

export class CardComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_VALIDATION_START, (event) => this.loading(event))
    this.el.addEventListener(EVENT_VALIDATION_FAIL, (event) => this.error(event))
    this.el.addEventListener(EVENT_LOAD_SUCCESS, (event) => this.success(event))
    this.el.addEventListener(EVENT_LOAD_FAIL, (event) => this.error(event))
    this.cardId = null
  }

  init () {
    this.el.append(HelperUtil.createHTML(`<div class="${CARD}__deck"></div>`))
    this._deck = this.el.querySelector(`.${CARD}__deck`)
  }

  error (event) {
    this.cardId = event.detail.id
    this.state = CARD_STATE_ERROR
  }

  success (event) {
    this.cardId = event.detail.id
    this.state = CARD_STATE_SUCCESS
  }

  loading (event) {
    this.cardId = event.detail.id
    this._deck.append(HelperUtil.createHTML(`<div id="${this.cardId}" class="${CARD}__card"></div>`))
    this.state = CARD_STATE_LOADING
  }

  set state (state) {
    this._card = this._deck.querySelector(`#${this.cardId}`)

    if (CARD_STATE_LOADING === state) {
      this._card.innerHTML = `<span class="spinner-grow text-primary" role="status"></span>`
    }

    if (CARD_STATE_ERROR === state) {
      this._card.innerHTML = `<span aria-hidden="true">&times;</span>`
    }

    if (CARD_STATE_SUCCESS === state) {
      this._card.innerHTML = `<img src="https://placeimg.com/150/150/people" class="${CARD}__card-img" alt="">`
    }
  }
}

export class ValidationService {
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
      throw new TypeError('Не корректный тип.')
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

export class HttpService {
  constructor ({ el }) {
    this.el = el
  }

  set endpoint (url) {
    this._url = url
  }

  set method (method) {
    this._method = method.toUpperCase()
  }

  set headers (headers) {
    this._headers = Object.assign(headers, {
      'Content-Type': 'application/json;charset=utf-8;multipart/form-file',
    })
  }

  send (file) {
    this.doRequest(file).then((response) => {
      if (response.ok) {
        this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_SUCCESS, {
          detail: {
            response: response.status, // @todo
            id: file.id
          }
        }))
      } else {
        this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_FAIL, {
          detail: {
            error: response.statusText, // @todo
            id: file.id
          }
        }))
      }
    }).catch((response) => {
      this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_FAIL, {
        detail: {
          error: response, // @todo
          id: file.id
        }
      }))
    })
  }

  async doRequest (file) {
    return await fetch(this._url, {
      method: this._method,
      headers: this._headers,
      body: JSON.stringify(file)
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

    // инициализируем болванку
    this.card = new CardComponent({ el: this.el })
    this.card.init()

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
    this.http.headers = this.conf.headers

    this.el.addEventListener('click', this.onClick.bind(this))
    this.el.addEventListener('change', this.onChange.bind(this))
  }

  onClick (event) {
    if (event.target.classList.contains(`${BUTTON}__button`) && !this.button.isDisable()) {
      this.el.querySelector('input').click()
    }
  }

  onChange (event) {
    if (event.target.files.length <= 0) {
      this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_FAIL, { detail: { error: 'Не выбрано ни одного файла' } }))
      return
    }

    const collection = new Set(event.target.files)

    for (let file of collection.values()) {

      file.id = HelperUtil.getUniqId()

      this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_START, { detail: { id: file.id } }))

      if (!this.validation.isValid(file)) {
        this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_FAIL, {
          detail: {
            id: file.id,
            error: this.validation.errors[0]
          }
        }))
        continue
      }

      this.http.send(file)
    }
  }
}