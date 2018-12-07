export class Validate {
  constructor () {}

  setAcceptExt (array) {
    this.acceptExt = array
  }

  setFileMaxSize (size) {
    this.fileMaxSize = size * 1024 * 1024
  }

  validation (file) {

    if (!this.acceptExt.includes(file.type)) {
      throw new Error('Формат файла отличается от разрешенных: ' + String(this.acceptExt))
    }

    if (file.size > this.fileMaxSize) {
      throw new Error('Размер файла превышает разрешенный лимит в ' + (this.fileMaxSize / 1024 / 1024) + 'Мб.')
    }

  }
}