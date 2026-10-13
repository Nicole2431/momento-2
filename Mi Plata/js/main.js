import { AppController } from './AppController.js'

let appController
window.onload = function () {
  window.appController = new AppController()
  window.appController.iniciar()
}
