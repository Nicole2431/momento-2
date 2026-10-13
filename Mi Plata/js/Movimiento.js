/**
 * CLASE MOVIMIENTO
 */
export class Movimiento {
  constructor(numeroCuenta, tipo, monto, descripcion, saldoResultante) {
    this.id = Date.now() + Math.random().toString(36).substr(2, 4)
    this.fechaHora = new Date().toLocaleString('es-CO')
    this.numeroCuenta = numeroCuenta
    this.tipo = tipo // 'Consignación', 'Retiro', 'Transferencia', 'Compra'
    this.monto = monto
    this.descripcion = descripcion
    this.saldoResultante = saldoResultante
  }
}
