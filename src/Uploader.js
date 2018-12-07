import { HttpService } from './HttpService.js'
import { Form } from './Form.js'
import { Validate } from './Validate.js'
import { getFormData } from './helpers.js'

export class Uploader {
  constructor ({ el, conf = { endPoint, filesLimit, fileMaxSize, acceptExt }, data }) {
    this.el = el

    this.acceptExt = conf.acceptExt || ['image/jpeg', 'image/png', 'image/gif']
    this.filesLimit = conf.filesLimit || 1
    this.fileMaxSize = conf.fileMaxSize || 5 * 1024 * 1024
    this.endPoint = conf.endPoint || '/'
    this.data = data || {}

    this.form = new Form({
      el: document.createElement('div'),
      onSubmit: this._onFormSubmit.bind(this),
    })
    this.form.setAccept(this.acceptExt)
    this.form.setLimit(this.filesLimit)

    this.validator = new Validate()
    this.validator.setAcceptExt(this.acceptExt)
    this.validator.setFileMaxSize(this.fileMaxSize)

    this.httpService = new HttpService(this.endPoint)

    this.el.append(this.form.el)
    this.render()
  }

  render () {
    this.form.render()
  }

  _onFormSubmit ({ files }) {

    if (files.length > this.filesLimit) {
      throw new Error('Количество файлов превышает разрешеный лимит.')
    }

    for (let file of files) {

      // @todo отрисовка болванки

      try {
        this.validator.validation(file)
      } catch (e) {
        // @todo вывести сообщение об ошибке в болванку
        console.log(e.message)
        continue
      }

      let data = getFormData(files, this.data)
      this.httpService.makeRequest(data)

      // @todo вывести изображение в болванку

    }

    this.render()
  }
}