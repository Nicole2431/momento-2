import { Cuenta } from './Cuenta.js'
/**
 * CLASE CUENTA DE AHORROS
 */
export class CuentaAhorros extends Cuenta {
  constructor(numeroCuenta, clienteUsuario, saldoInicial = 0) {
    super(numeroCuenta, clienteUsuario, saldoInicial)
    this.tasaInteresMensual = 0.015 // 1.5% mensual
    this.tipoNombre = 'Cuenta de Ahorros'
  }

  /**
   * POLIMORFISMO EN RETIRAR:
   * En la Cuenta de Ahorros se calcula y aplica el rendimiento/interés mensual (1.5%) en el momento del retiro.
   */
  retirar(monto) {
    if (monto <= 0) {
      throw new Error('El monto a retirar debe ser mayor a cero.')
    }
    if (monto > this.saldo) {
      throw new Error('Saldo insuficiente en su Cuenta de Ahorros.')
    }

    // Cálculo del rendimiento/interés del 1.5% sobre el monto retirado
    const interesGenerado = monto * this.tasaInteresMensual
    this.saldo -= monto

    // Se abonará la bonificación por interés de rendimiento
    this.saldo += interesGenerado

    this.guardarMovimiento(
      'Retiro con Rendimiento',
      monto,
      `Retiro de $${monto.toLocaleString()} + Rendimiento del 1.5% (+$${interesGenerado.toLocaleString()})`
    )
    return true
  }
}
