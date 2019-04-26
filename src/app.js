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
const EVENT_LOAD_COMPLETE = EVENT + '-load-complete'

const defaultConf = {

  /**
   * FormComponent configuration
   */

  /**
   * AlertComponent configuration
   */
  alertComponentElement: null,

  /**
   * ButtonComponent configuration
   */

  /**
   * CardComponent configuration
   */
  cardComponentElement: null,
  cardReverseDirection: false,

  /**
   * ThumbService configuration
   */
  thumbHeight: 150,
  thumbWidth: 150,

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
    this.el.addEventListener(EVENT_VALIDATION_START, () => this.onLoading())
    this.el.addEventListener(EVENT_LOAD_SUCCESS, () => this.onReady())
    this.el.addEventListener(EVENT_LOAD_FAIL, () => this.onError())
    this.el.addEventListener(EVENT_VALIDATION_FAIL, () => this.onReady())
  }

  isDisable () {
    return this._button.disabled
  }

  render () {
    this.el.append(HelperUtil.createHTML(this.template()))
    this._button = this.el.querySelector(`.${BUTTON}__button`)
    this.onReady()
  }

  onReady () {
    this.state = BUTTON_STATE_READY
    this._button.disabled = false
  }

  onLoading () {
    this.state = BUTTON_STATE_LOADING
    this._button.disabled = true
  }

  onError () {
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

  set element (element) {
    this._element = document.querySelector(element)
  }

  init () {
    let spot = this.el

    if (this._element) {
      spot = this._element
    }

    spot.append(HelperUtil.createHTML(`<div class="${ALERT}__group"></div>`))
    this._alerts = spot.querySelector(`.${ALERT}__group`)
  }

  handleEvent (event) {
    // ошибки ответа сервера
    if (event.detail.file.hasOwnProperty('response')) {
      event.detail.file.error = event.detail.file.response.statusText
    }

    this._alerts.append(HelperUtil.createHTML(this.template()))
    this._alert = this._alerts.querySelectorAll(`.${ALERT}__alert:last-child`)
    this._alert[0].append(event.detail.file.error)
  }

  template () {
    return `<div class="alert alert-warning alert-dismissible fade show ${ALERT}__alert" role="alert"></div>`
  }
}

export class CardComponent {
  constructor ({ el }) {
    this.el = el
    this.el.addEventListener(EVENT_VALIDATION_START, this.onLoading.bind(this))
    this.el.addEventListener(EVENT_VALIDATION_FAIL, this.onError.bind(this))
    this.el.addEventListener(EVENT_LOAD_COMPLETE, this.onSuccess.bind(this))
    this.el.addEventListener(EVENT_LOAD_FAIL, this.onError.bind(this))
    this._file = null
  }

  set element (element) {
    this._element = document.querySelector(element)
  }

  set directionReverse (value) {
    this._isDirectionReverse = !!value
  }

  init () {
    let spot = this.el

    if (this._element) {
      spot = this._element
    }

    spot.append(HelperUtil.createHTML(`<div class="${CARD}__deck"></div>`))
    this._deck = spot.querySelector(`.${CARD}__deck`)
  }

  onError (event) {
    this._file = event.detail.file
    this.state = CARD_STATE_ERROR
  }

  onSuccess (event) {
    this._file = event.detail.file
    this.state = CARD_STATE_SUCCESS
  }

  onLoading (event) {
    this._file = event.detail.file

    const tpl = HelperUtil.createHTML(`<div id="${this._file.id}" class="${CARD}__card"></div>`)

    if (this._isDirectionReverse) {
      this._deck.prepend(tpl)
    } else {
      this._deck.append(tpl)
    }

    this.state = CARD_STATE_LOADING
  }

  set state (state) {
    this._card = this._deck.querySelector(`#${this._file.id}`)

    if (CARD_STATE_LOADING === state) {
      this._card.innerHTML = `<span class="spinner-grow text-primary" role="status"></span>`
    }

    if (CARD_STATE_ERROR === state) {
      this._card.innerHTML = `<span aria-hidden="true">&times;</span>`
    }

    if (CARD_STATE_SUCCESS === state) {
      this._card.innerHTML = `<img src="${this._file.dataURL}" class="${CARD}__card-img" alt="">`
    }
  }
}

export class ThumbService {
  constructor ({ el }) {
    this.el = el
    this.reader = new FileReader()
    this.reader.addEventListener('load', this.onLoad.bind(this))
    this.el.addEventListener(EVENT_LOAD_SUCCESS, this.onSuccess.bind(this))
    this._file = null
  }

  set height (pixelSize) {
    this._height = pixelSize
  }

  set width (pixelSize) {
    this._width = pixelSize
  }

  onSuccess (event) {
    this._file = event.detail.file
    this.reader.readAsDataURL(this._file)
  }

  onLoad (event) {
    const image = new Image(this._width, this._height)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    image.onload = () => {

      // определяем размер холста
      canvas.width = image.width;
      canvas.height = image.height;

      // если ширина изображения равна высоте, а настройки превьюшек не равны
      if (image.naturalHeight === image.naturalWidth && image.width > image.height) {
        image.height = (image.width)
      }

      // если ширина изображения равна высоте, а настройки превьюшек не равны
      if (image.naturalHeight === image.naturalWidth && image.width < image.height) {
        image.width = (image.height)
      }

      // если высота изображения больше ширины
      if (image.naturalHeight > image.naturalWidth) {
        image.height = image.width * (image.naturalHeight / image.naturalWidth)
      }

      // если ширина изображения больше высоты
      if (image.naturalWidth > image.naturalHeight) {
        image.width = image.height * (image.naturalWidth / image.naturalHeight)
      }

      ctx.drawImage(image, 0, 0, image.width, image.height)

      this._file.dataURL = canvas.toDataURL()
      this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_COMPLETE, { detail: { file: this._file } }))
    }

    image.src = event.target.result
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
      file.response = response
      if (response.ok) {
        this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_SUCCESS, { detail: { file } }))
      } else {
        this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_FAIL, { detail: { file } }))
      }
    }).catch((response) => {
      file.error = response
      this.el.dispatchEvent(new CustomEvent(EVENT_LOAD_FAIL, { detail: { file } }))
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
    this.alert.element = this.conf.alertComponentElement
    this.alert.init()

    // отрисовываем кнопку
    this.button = new ButtonComponent({ el: this.el })
    this.button.render()

    // инициализируем болванку
    this.card = new CardComponent({ el: this.el })
    this.card.element = this.conf.cardComponentElement
    this.card.directionReverse = this.conf.cardReverseDirection
    this.card.init()

    // инициализация сервиса превьюшек
    this.thumb = new ThumbService({ el: this.el })
    this.thumb.height = this.conf.thumbHeight
    this.thumb.width = this.conf.thumbWidth

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

    // настраиваем параметры http сервиса
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

      this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_START, { detail: { file } }))

      if (!this.validation.isValid(file)) {
        file.error = this.validation.errors[0]
        this.el.dispatchEvent(new CustomEvent(EVENT_VALIDATION_FAIL, { detail: { file } }))
        continue
      }

      this.http.send(file)
    }
  }
}