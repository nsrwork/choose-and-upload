export class Validate {
  constructor () {}

  setAcceptExt (extentions) {
    this.acceptExt = extentions
  }

  setFileMaxSize (sizeAsMb) {
    this.fileMaxSize = sizeAsMb * 1024 * 1024
  }

  validation (fileWrap = {status, message, file: {}}) {

    if (!fileWrap.file instanceof File) {
      throw new TypeError( 'Не корретный тип.')
    }

    if (!this.acceptExt.includes(fileWrap.file.type)) {
      throw new Error( 'Формат файла "' + fileWrap.file.name + '" отличается от разрешенных: ' + String(this.acceptExt))
    }

    if (fileWrap.file.size > this.fileMaxSize) {
      throw new TypeError( 'Размер файла "' + fileWrap.file.name + '" превышает разрешенный лимит в ' + (this.fileMaxSize / 1024 / 1024) + 'Мб.')
    }

  }
}