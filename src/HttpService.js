export class HttpService {
  constructor (url) {
    this.endPoint = url
  }

  makeRequest (data) {

    const xhr = new XMLHttpRequest()

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        console.log(xhr.response)
      }
    })

    xhr.upload.addEventListener('progress', (e) => {
      const percent_complete = (e.loaded / e.total) * 100
      console.log(percent_complete)
    })

    xhr.responseType = 'json'

    xhr.open('POST', this.endPoint)
    xhr.send(data)
  }
}