import { Form } from './Form.js'
import { Validate } from './Validate.js'
import { Thumb } from './Thumb.js'

export class Uploader {
  constructor ({
                 el, conf = {
      endPoint,
      filesLimit,
      fileMaxSize,
      acceptExt,
      thumbsPool,
    }, data,
               }) {
    this.el = el

    this.acceptExt = conf.acceptExt || ['image/jpeg', 'image/png', 'image/gif']
    this.filesLimit = conf.filesLimit || 1
    this.fileMaxSize = conf.fileMaxSize || 5 * 1024 * 1024
    this.endPoint = conf.endPoint || '/'
    this.data = data || {}
    this.thumbsPool = conf.thumbsPool || '.js-thumbs-pool'

    this.form = new Form({
      el: document.createElement('div'),
      onSubmit: this._onFormSubmit.bind(this),
    })
    this.form.setAccept(this.acceptExt)
    this.form.setLimit(this.filesLimit)

    this.validator = new Validate()
    this.validator.setAcceptExt(this.acceptExt)
    this.validator.setFileMaxSize(this.fileMaxSize)

    this.thumb = new Thumb({
      el: document.querySelector(this.thumbsPool),
    })

    this.el.append(this.form.el)
    this.render()
  }

  render () {
    this.form.render()
  }

  _onFormSubmit ({ files }) {

    if (files.length > this.filesLimit) {
      alert(
        'Вы выбрали слишком много файлов, попробуйте еще раз, но не более: ' +
        this.filesLimit)
      return
    }

    for (let file of files) {

      // отрисовка болванки
      this.thumb.addLoader()

      try {
        this.validator.validation(file)
      } catch (e) {
        console.log(e)
        // @todo вывести сообщение об ошибке в болванку
        this.thumb.setSrc('error.png')
        this.thumb.addError()
        continue
      }

      let formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('data', JSON.stringify(this.data))

      fetch(this.endPoint, {
        method: 'POST',
        body: formData,
      }).
        then(response => response.json()).
        then((resolve) => {
          console.log(resolve.data.img_path.md)
          // вывести изображение в болванку
          this.thumb.setSrc(resolve.data.img_path.md)
          this.thumb.setHref(resolve.data.img_url)
          this.thumb.addThumb()
        }).
        catch((e) => {
          console.log(e)
          // @todo вывести сообщение об ошибке в болванку
          this.thumb.setSrc('error.png')
          this.thumb.addError()
        })

    }

    this.render()
  }
}