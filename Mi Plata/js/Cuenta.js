import { Movimiento } from './Movimiento.js'
/**
 * CLASE CUENTA
 */
export class Cuenta {
  constructor(numeroCuenta, clienteUsuario, saldoInicial = 0) {
    this.numeroCuenta = numeroCuenta
    this.clienteUsuario = clienteUsuario
    this.saldo = saldoInicial
    this.movimientos = [] // Array de transacciones (List<T>)
  }

  consultarSaldo() {
    return this.saldo
  }

  guardarMovimiento(tipo, monto, descripcion) {
    const mov = new Movimiento(this.numeroCuenta, tipo, monto, descripcion, this.saldo)
    this.movimientos.unshift(mov) // Agregar al inicio (orden descendente)
    return mov
  }

  consignar(monto) {
    if (monto <= 0) {
      throw new Error('El monto a consignar debe ser mayor a cero.')
    }
    this.saldo += monto
    this.guardarMovimiento('Consignación', monto, 'Consignación de efectivo')
    return true
  }

  // Método base de retiro (Será sobrescrito en clases hijas - Polimorfismo)
  retirar(monto) {
    if (monto <= 0) {
      throw new Error('El monto a retirar debe ser mayor a cero.')
    }
    if (monto > this.saldo) {
      throw new Error('Saldo insuficiente para esta operación.')
    }
    this.saldo -= monto
    this.guardarMovimiento('Retiro', monto, 'Retiro de dinero')
    return true
  }

  transferir(monto, cuentaDestino) {
    if (this.numeroCuenta === cuentaDestino.numeroCuenta) {
      throw new Error('No se permiten transferencias al mismo producto.')
    }
    // Retirar de la cuenta de origen
    this.retirar(monto)
    // Consignar en la cuenta de destino
    cuentaDestino.consignarDirecta(monto, `Transferencia recibida de ${this.numeroCuenta}`)
    // Actualizar movimiento de origen
    this.guardarMovimiento('Transferencia Enviada', monto, `Transferencia a ${cuentaDestino.numeroCuenta}`)
    return true
  }

  // Consignación interna para recibos de transferencias
  consignarDirecta(monto, descripcion) {
    this.saldo += monto
    this.guardarMovimiento('Transferencia Recibida', monto, descripcion)
  }
}