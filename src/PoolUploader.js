import { Form } from './Form.js'
import { Validate } from './Validate.js'
import { Thumb } from './Thumb.js'
import { Alert } from './Alert.js'

export class PoolUploader {
  constructor ({
                 el, conf = {
      endPoint,
      filesLimit,
      fileMaxSize,
      acceptExt,
      previewPool,
      alertPool,
      previewTemplate,
      loaderTemplate,
      failTemplate,
      alertTemplate,
    }, data,
               }) {
    this.el = document.querySelector(el)
    this.data = data
    this.acceptExt = conf.acceptExt
    this.filesLimit = conf.filesLimit
    this.fileMaxSize = conf.fileMaxSize
    this.endPoint = conf.endPoint
    this.previewPool = conf.previewPool
    this.alertPool = conf.alertPool
    this.errorImg = conf.errorImg
    this.loaderImg = conf.loaderImg
    this.previewTemplate = conf.previewTemplate
    this.loaderTemplate = conf.loaderTemplate
    this.failTemplate = conf.failTemplate
    this.alertTemplate = conf.alertTemplate

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
      el: document.querySelector(this.previewPool),
      previewTemplate: this.previewTemplate,
      loaderTemplate: this.loaderTemplate,
      failTemplate: this.failTemplate,
    })

    this.message = new Alert({
      el: document.querySelector(this.alertPool),
      alertTemplate: this.alertTemplate,
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

    if (0 === this.filesLimit) {
      this.message.setDanger('Вы достигли лимита на загрузку.')
      this.message.add()
      return
    }

    if (files.length > this.filesLimit) {
      this.message.setDanger(
        'Вы выбрали слишком много файлов, попробуйте еще раз, но не более ' +
        this.filesLimit)
      this.message.add()
      return
    }

    for (let file of files) {

      let fileCurator = {
        status: 'CHECKING',
        message: '',
        file: file,
      }
      this.pool.push(fileCurator)

      try {
        this.validator.validation(fileCurator)
        fileCurator.status = 'APPROVED'
      } catch (e) {
        fileCurator.status = 'ERROR'
        fileCurator.message = e.message
      }
    }

    for (let file of this.pool) {

      if ('ERROR' === file.status) {
        this.message.setDanger(file.message)
        this.message.add()
        this.thumb.addFail()
        file.status = 'CANCELED'
      }

      if ('APPROVED' !== file.status) {
        continue
      }

      // отрисовка болванки
      this.thumb.addLoader()

      file.status = 'SEND'

      let formData = new FormData()
      formData.append('file', file.file, file.file.name)
      formData.append('data', JSON.stringify(this.data))

      let send = fetch(this.endPoint, {
        method: 'POST',
        body: formData,
      }).then(response => response.json())

      send.then((resolve) => {

        if (resolve.error) {
          file.status = 'CANCELED'
          file.message = resolve.error
          this.message.setDanger(file.message)
          this.message.add()
          this.thumb.addFail()
        } else {
          file.status = 'UPLOADED'
          // @todo
          this.thumb.setSrc(resolve.data.img_path.md)
          this.thumb.setHref(resolve.data.img_url)
          this.thumb.setRank(resolve.data.rank)

          this.thumb.addPreview()
          this.decrementFilesLimit()
        }
      })
    }

    this.render()
  }

}