export class Validate {
  constructor () {}

  setAcceptExt (array) {
    this.acceptExt = array
  }

  setFileMaxSize (size) {
    this.fileMaxSize = size * 1024 * 1024
  }

  validation (fileWrap = {status, message, file: {}}) {

    if (!fileWrap.file instanceof File) {
      throw new TypeError( 'Не корретный тип.')
    }

    if (!this.acceptExt.includes(fileWrap.file.type)) {
      fileWrap.status = 'ERROR'
      fileWrap.message = 'Формат файла "' + fileWrap.file.name + '" отличается от разрешенных: ' + String(this.acceptExt)
    }

    if (fileWrap.file.size > this.fileMaxSize) {
      fileWrap.status = 'ERROR'
      fileWrap.message = 'Размер файла "' + fileWrap.file.name + '" превышает разрешенный лимит в ' + (this.fileMaxSize / 1024 / 1024) + 'Мб.'
    }

  }
}