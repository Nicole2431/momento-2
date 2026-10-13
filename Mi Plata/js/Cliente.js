/**
 * CLASE CLIENTE
 */
export class Cliente {
  constructor(identificacion, nombre, celular, usuario, contrasena) {
    this.identificacion = identificacion
    this.nombre = nombre
    this.celular = celular
    this.usuario = usuario
    this.contrasena = contrasena
    this.intentosFallidos = 0 // Intentos de inicio de sesión
    this.bloqueado = false // Estado de seguridad de la cuenta
  }

  validarContrasena(pass) {
    return this.contrasena === pass
  }

  incrementarIntentos() {
    this.intentosFallidos++
    if (this.intentosFallidos >= 3) {
      this.bloqueado = true
    }
    return this.intentosFallidos
  }

  resetearIntentos() {
    this.intentosFallidos = 0
  }

  desbloquear() {
    this.bloqueado = false
    this.intentosFallidos = 0
  }
}