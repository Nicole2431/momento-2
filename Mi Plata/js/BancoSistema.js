import { Cliente } from './Cliente.js'
import { CuentaAhorros } from './CuentaAhorros.js'
import { CuentaCorriente } from './CuentaCorriente.js'
import { TarjetaCredito } from './TarjetaCredito.js'

/**
 * CLASE BANCO SISTEMA
 */
export class BancoSistema {
  constructor() {
    this.clientes = []
    this.cuentas = []
    this.usuarioActual = null
    this.cargarDatosIniciales()
  }

  // Cargar datos por defecto si localStorage está vacío
  cargarDatosIniciales() {
    const clientesGuardados = localStorage.getItem('mi_plata_clientes')
    if (!clientesGuardados) {
      // Cliente por defecto para demostración inmediata
      const demoCliente = new Cliente('10102030', 'Juan Pérez', '3001234567', 'juan', '1234')
      this.clientes.push(demoCliente)

      // Cuentas por defecto para el demo
      const ctaAhorros = new CuentaAhorros('AHORROS-101', 'juan', 1500000)
      const ctaCorriente = new CuentaCorriente('CORRIENTE-102', 'juan', 800000)
      const tarCredito = new TarjetaCredito('CREDITO-103', 'juan', 4000000)

      this.cuentas.push(ctaAhorros, ctaCorriente, tarCredito)
      this.guardarEnStorage()
    } else {
      this.restaurarDesdeStorage()
    }
  }

  guardarEnStorage() {
    localStorage.setItem('mi_plata_clientes', JSON.stringify(this.clientes))
    localStorage.setItem('mi_plata_cuentas', JSON.stringify(this.cuentas))
  }

  restaurarDesdeStorage() {
    const rawClientes = JSON.parse(localStorage.getItem('mi_plata_clientes') || '[]')
    const rawCuentas = JSON.parse(localStorage.getItem('mi_plata_cuentas') || '[]')

    // Re-instanciar Objetos con sus Clases correspondientes (POO intacto)
    this.clientes = rawClientes.map((c) => {
      const cli = new Cliente(c.identificacion, c.nombre, c.celular, c.usuario, c.contrasena)
      cli.intentosFallidos = c.intentosFallidos || 0
      cli.bloqueado = c.bloqueado || false
      return cli
    })

    this.cuentas = rawCuentas.map((cta) => {
      let objCta
      if (cta.tipoNombre === 'Cuenta de Ahorros') {
        objCta = new CuentaAhorros(cta.numeroCuenta, cta.clienteUsuario, cta.saldo)
      } else if (cta.tipoNombre === 'Cuenta Corriente') {
        objCta = new CuentaCorriente(cta.numeroCuenta, cta.clienteUsuario, cta.saldo)
      } else if (cta.tipoNombre && cta.tipoNombre.includes('Tarjeta')) {
        objCta = new TarjetaCredito(cta.numeroCuenta, cta.clienteUsuario, cta.cupoCredito || 3000000)
        objCta.cupoDisponible = cta.cupoDisponible
        objCta.deudaTotal = cta.deudaTotal
      } else {
        objCta = new Cuenta(cta.numeroCuenta, cta.clienteUsuario, cta.saldo)
      }
      objCta.movimientos = cta.movimientos || []
      return objCta
    })
  }

  // Registrar nuevo cliente
  registrarCliente(identificacion, nombre, celular, usuario, contrasena) {
    const existe = this.clientes.find((c) => c.usuario.toLowerCase() === usuario.toLowerCase())
    if (existe) {
      throw new Error('El nombre de usuario ya se encuentra registrado.')
    }

    const nuevoCliente = new Cliente(identificacion, nombre, celular, usuario, contrasena)
    this.clientes.push(nuevoCliente)

    // Crear automáticamente sus productos bancarios de bienvenida
    const numRnd = Math.floor(100 + Math.random() * 900)
    const ctaAhorros = new CuentaAhorros(`AHORROS-${numRnd}`, usuario, 0)
    const ctaCorriente = new CuentaCorriente(`CORRIENTE-${numRnd}`, usuario, 0)
    const tarCredito = new TarjetaCredito(`CREDITO-${numRnd}`, usuario, 2000000)

    this.cuentas.push(ctaAhorros, ctaCorriente, tarCredito)
    this.guardarEnStorage()
    return nuevoCliente
  }

  // Autenticación de Usuario con contador de intentos
  autenticar(usuario, contrasena) {
    const cliente = this.clientes.find((c) => c.usuario.toLowerCase() === usuario.toLowerCase())

    if (!cliente) {
      throw new Error('El nombre de usuario no existe en el sistema.')
    }

    if (cliente.bloqueado) {
      throw new Error('Cuenta bloqueada por seguridad debido a 3 intentos fallidos. Contacte con un administrador.')
    }

    if (!cliente.validarContrasena(contrasena)) {
      const intentos = cliente.incrementarIntentos()
      this.guardarEnStorage()

      if (cliente.bloqueado) {
        throw new Error('Tercer intento fallido alcanzado. La cuenta ha sido BLOQUEADA.')
      } else {
        throw new Error(`Contraseña incorrecta. Intentos restantes: ${3 - intentos}`)
      }
    }

    // Credenciales válidas
    cliente.resetearIntentos()
    this.usuarioActual = cliente
    this.guardarEnStorage()
    return cliente
  }

  obtenerCuentasUsuario(usuario) {
    return this.cuentas.filter((c) => c.clienteUsuario.toLowerCase() === usuario.toLowerCase())
  }

  obtenerCuentaPorNumero(numeroCuenta) {
    return this.cuentas.find((c) => c.numeroCuenta === numeroCuenta)
  }
}
