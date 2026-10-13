import { Cuenta } from './Cuenta.js'
/**
 * CLASE CUENTA CORRIENTE
 */
export class CuentaCorriente extends Cuenta {
  constructor(numeroCuenta, clienteUsuario, saldoInicial = 0) {
    super(numeroCuenta, clienteUsuario, saldoInicial)
    this.sobregiroPorcentaje = 0.2 // 20% adicional
    this.tipoNombre = 'Cuenta Corriente'
  }

  obtenerLimiteDisponible() {
    // Si el saldo es positivo, permite hasta Saldo + 20% adicional
    // Ejemplo: Saldo 1.000.000 => Límite = 1.200.000
    if (this.saldo >= 0) {
      return this.saldo + this.saldo * this.sobregiroPorcentaje
    } else {
      // Si ya está en sobregiro, el límite es el sobregiro máximo que tenía inicialmente menos lo usado
      return Math.max(0, this.saldo)
    }
  }

  /**
   * Permite retirar hasta un 20% adicional sobre el saldo actual (Sobregiro).
   */
  retirar(monto) {
    if (monto <= 0) {
      throw new Error('El monto a retirar debe ser mayor a cero.')
    }

    const limite = this.obtenerLimiteDisponible()
    if (monto > limite) {
      throw new Error(`Excede el límite permitido con sobregiro del 20% ($${limite.toLocaleString()}).`)
    }

    this.saldo -= monto
    const estaEnSobregiro = this.saldo < 0
    const desc = estaEnSobregiro
      ? `Retiro con sobregiro (Saldo negativo: $${this.saldo.toLocaleString()})`
      : 'Retiro estándar de cuenta corriente'

    this.guardarMovimiento('Retiro Corriente', monto, desc)
    return true
  }
}
