# Choose And Upload
Загрузчик картинок с созданием превьюшек на клиенте. Имеется возможность указывать отдельные блоки для вывода ошибок и превьюшек.

## Инициализация

```HTML
<div id="ChooseAndUpload"></div>
```

```js
import { App as ChooseAndUpload } from './src/app.js'

new ChooseAndUpload({
    el: '#ChooseAndUpload',
    conf: {
      accept: ['image/jpeg', 'image/png'],
      endPoint: '/',
      filesLimit: 2,
      fileMaxSize: 1
    }
})
```

## Требования

Библиотека использует функционал фреймворка Bootstrap для отображения кнопки и алертов. Рекомендуемая версия 4+.
