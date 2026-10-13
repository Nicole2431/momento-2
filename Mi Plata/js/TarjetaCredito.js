import { Cuenta } from './Cuenta.js'
/**
 * CLASE TARJETA DE CRÉDITO
 */
export class TarjetaCredito extends Cuenta {
  constructor(numeroCuenta, clienteUsuario, cupoCredito = 3000000) {
    super(numeroCuenta, clienteUsuario, 0)
    this.cupoCredito = cupoCredito
    this.cupoDisponible = cupoCredito
    this.deudaTotal = 0
    this.tipoNombre = 'Tarjeta de Crédito Ultra Plata'
  }

  consultarSaldo() {
    return this.cupoDisponible // Retorna cupo disponible
  }

  // Calcular tasa según número de cuotas (Regla de Negocio 3.3)
  static calcularTasaInteres(cuotas) {
    if (cuotas <= 2) return 0.0 // 0%
    if (cuotas <= 6) return 0.019 // 1.9%
    return 0.023 // 2.3%
  }

  // Fórmula financiera obligatoria de cuota mensual
  static calcularCuotaMensual(capital, cuotas) {
    const tasa = TarjetaCredito.calcularTasaInteres(cuotas)
    if (tasa === 0) {
      return capital / cuotas
    }
    // Cuota mensual = (Capital x tasa) / (1 - (1 + tasa)^(-n))
    const cuota = (capital * tasa) / (1 - Math.pow(1 + tasa, -cuotas))
    return cuota
  }

  // Registrar compra a cuotas
  comprar(monto, cuotas, descripcion) {
    if (monto <= 0) throw new Error('El monto debe ser mayor a cero.')
    if (monto > this.cupoDisponible) {
      throw new Error(`Cupo de crédito insuficiente. Cupo disponible: $${this.cupoDisponible.toLocaleString()}`)
    }

    const tasa = TarjetaCredito.calcularTasaInteres(cuotas)
    const cuotaMensual = TarjetaCredito.calcularCuotaMensual(monto, cuotas)

    this.cupoDisponible -= monto
    this.deudaTotal += monto

    const descMovimiento = `${descripcion} (${cuotas} cuotas a ${(tasa * 100).toFixed(1)}% int. - Cuota mensual: $${Math.round(cuotaMensual).toLocaleString()})`
    this.guardarMovimiento('Compra Crédito', monto, descMovimiento)
    return cuotaMensual
  }

  // Para Tarjeta de Crédito, consignar es abonar/pagar la deuda
  consignar(monto) {
    if (monto <= 0) throw new Error('El monto a abonar debe ser mayor a cero.')
    if (this.deudaTotal < monto) throw new Error('El monto a abonar debe ser menor que la deuda.')

    this.deudaTotal = Math.max(0, this.deudaTotal - monto)
    this.cupoDisponible = Math.min(this.cupoCredito, this.cupoDisponible + monto)

    this.guardarMovimiento('Pago Tarjeta', monto, 'Abono/Pago a la deuda de Tarjeta de Crédito')
    return true
  }
}