import { Form } from './Form.js'
import { Validate } from './Validate.js'
import { Thumb } from './Thumb.js'
import { FlashMessage } from './FlashMessage.js'

export class Uploader {
  constructor ({
                 el, conf = {
      endPoint,
      filesLimit,
      fileMaxSize,
      acceptExt,
      thumbsPool,
      errorsPool
    }, data,
               }) {
    this.el = document.querySelector(el)
    this.acceptExt = conf.acceptExt
    this.filesLimit = conf.filesLimit
    this.fileMaxSize = conf.fileMaxSize
    this.endPoint = conf.endPoint
    this.data = data
    this.thumbsPool = conf.thumbsPool
    this.errorsPool = conf.errorsPool

    this.pool = []

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

    this.message = new FlashMessage({
      el: document.querySelector(this.errorsPool),
    })

    this.el.append(this.form.el)
    this.render()
  }

  decrementFilesLimit () {
    --this.filesLimit
  }

  render () {
    this.form.render()
  }

  _onFormSubmit (files) {

    if (files.length > this.filesLimit) {
      this.message.add('Вы выбрали слишком много файлов, попробуйте еще раз, но не более ' + this.filesLimit)
      return
    }

    for (let file of files) {

      let fileWrap = {}
      fileWrap.status = 'CHECKING'
      fileWrap.message = ''
      fileWrap.file = file
      this.pool.push(fileWrap);

      try {
        this.validator.validation(fileWrap)
      } catch (e) {
        console.log(e)
        fileWrap.status = 'ERROR'
        fileWrap.message = e.message
      }

    }

    for (let file of this.pool) {

      if (file.status === 'UPLOADED' || file.status === 'CANCELED') {
        continue
      }

      // отрисовка болванки
      this.thumb.addLoader()

      if (file.status === 'ERROR') {
        this.message.add(file.message)
        this.thumb.setSrc('error.svg')
        this.thumb.addError()
        file.status = 'CANCELED'
        continue
      }

      file.status = 'SEND'

      let formData = new FormData()
      formData.append('file', file.file, file.file.name)
      formData.append('data', JSON.stringify(this.data))

      let send = fetch(this.endPoint, {
        method: 'POST',
        body: formData,
      }).then(response => response.json())

      send.then((resolve) => {
          file.status = 'UPLOADED'
          /*
          resolve must return obj like as:
          data {
            img_path: { // paths to different size of img
              md: '', // url
            },
            img_url: '' // url to img
          }
           */
          this.thumb.setSrc(resolve.data.img_path.md)
          this.thumb.setHref(resolve.data.img_url)
          this.thumb.addThumb()
          this.decrementFilesLimit()
        }).catch((e) => {
          console.log(e)
          file.status = 'ERROR'
          file.message = e.message
          this.message.add(file.message)
          this.thumb.setSrc('error.svg')
          this.thumb.addError()
        })
    }

    this.render()
  }

}