export function getFormData (file, data) {
  let formData = new FormData()
  formData.append('file', file[0], file[0].name)
  formData.append('data', JSON.stringify(data))

  return formData
}