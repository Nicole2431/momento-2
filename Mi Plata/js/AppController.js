import { BancoSistema } from './BancoSistema.js'
import { CuentaAhorros } from './CuentaAhorros.js'
import { CuentaCorriente } from './CuentaCorriente.js'
import { TarjetaCredito } from './TarjetaCredito.js'
/**
 * CONTROLADOR DE INTERFAZ Y EVENTOS (AppController)
 */
export class AppController {
  constructor() {
    this.banco = new BancoSistema()
    this.tabActual = 'tab-consignar'
  }

  iniciar() {
    this.mostrarVista('vista-inicio')
    this.actualizarBarraNavegacion()
  }

  // Mostrar avisos informativos / toasts dinámicos
  notificar(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container')
    const toast = document.createElement('div')

    let bgColors = 'bg-slate-900 border-cyan-500 text-cyan-300'
    let icon = 'fa-info-circle'

    if (tipo === 'exito') {
      bgColors = 'bg-slate-900 border-emerald-500 text-emerald-300'
      icon = 'fa-circle-check'
    } else if (tipo === 'error') {
      bgColors = 'bg-slate-900 border-rose-500 text-rose-300'
      icon = 'fa-circle-exclamation'
    }

    toast.className = `p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs backdrop-blur transition-all duration-300 transform translate-y-2 pointer-events-auto ${bgColors}`
    toast.innerHTML = `
                    <div class="flex items-center gap-2">
                        <i class="fa-solid ${icon} text-base"></i>
                        <span>${mensaje}</span>
                    </div>
                    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
                `

    container.appendChild(toast)
    setTimeout(() => {
      if (toast.parentElement) toast.remove()
    }, 5000)
  }

  // Control de vistas (Single Page Application)
  mostrarVista(idVista) {
    const vistas = [
      'vista-inicio',
      'vista-productos',
      'vista-simulador',
      'vista-login',
      'vista-registro',
      'vista-cajero',
      'vista-admin'
    ]
    vistas.forEach((v) => {
      const el = document.getElementById(v)
      if (el) el.classList.add('hidden')
    })

    const vistaDestino = document.getElementById(idVista)
    if (vistaDestino) vistaDestino.classList.remove('hidden')

    // Si ingresa al panel de cajero, renderizar sus tarjetas
    if (idVista === 'vista-cajero' && this.banco.usuarioActual) {
      this.renderizarPanelCajero()
    }

    // Si ingresa a la vista admin, renderizar tabla CRUD
    if (idVista === 'vista-admin') {
      this.renderizarAdminCRUD()
    }

    // Ocultar menú móvil si estuviera abierto
    document.getElementById('menu-movil').classList.add('hidden')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  toggleMenuMovil() {
    const el = document.getElementById('menu-movil')
    el.classList.toggle('hidden')
  }

  actualizarBarraNavegacion() {
    const navInvitado = document.getElementById('nav-invitado')
    const navAutenticado = document.getElementById('nav-autenticado')
    const movilInvitado = document.getElementById('movil-invitado')
    const movilAutenticado = document.getElementById('movil-autenticado')
    const txtUsuarioNav = document.getElementById('nombre-usuario-nav')

    if (this.banco.usuarioActual) {
      navInvitado.classList.add('hidden')
      navAutenticado.classList.remove('hidden')
      movilInvitado.classList.add('hidden')
      movilAutenticado.classList.remove('hidden')
      txtUsuarioNav.textContent = this.banco.usuarioActual.nombre
    } else {
      navInvitado.classList.remove('hidden')
      navAutenticado.classList.add('hidden')
      movilInvitado.classList.remove('hidden')
      movilAutenticado.classList.add('hidden')
    }
  }

  procesarRegistro() {
    const identificacion = document.getElementById('reg-identificacion').value.trim()
    const celular = document.getElementById('reg-celular').value.trim()
    const nombre = document.getElementById('reg-nombre').value.trim()
    const usuario = document.getElementById('reg-usuario').value.trim()
    const pass = document.getElementById('reg-password').value
    const passConfirm = document.getElementById('reg-confirm-password').value

    if (pass !== passConfirm) {
      this.notificar('Las contraseñas no coinciden.', 'error')
      return
    }

    try {
      const nuevoCliente = this.banco.registrarCliente(identificacion, nombre, celular, usuario, pass)
      this.notificar(`¡Bienvenido ${nuevoCliente.nombre}! Registro exitoso.`, 'exito')
      document.getElementById('form-registro').reset()
      this.mostrarVista('vista-login')
    } catch (err) {
      this.notificar(err.message, 'error')
    }
  }

  procesarLogin() {
    const usuario = document.getElementById('login-usuario').value.trim()
    const pass = document.getElementById('login-password').value

    try {
      const cliente = this.banco.autenticar(usuario, pass)
      this.actualizarBarraNavegacion()
      this.notificar(`Sesión iniciada correctamente. ¡Hola, ${cliente.nombre}!`, 'exito')
      document.getElementById('form-login').reset()
      this.actualizarBadgeIntentos(3)
      this.mostrarVista('vista-cajero')
    } catch (err) {
      this.notificar(err.message, 'error')

      // Actualizar badge de intentos en UI
      const cli = this.banco.clientes.find((c) => c.usuario.toLowerCase() === usuario.toLowerCase())
      if (cli) {
        const restantes = Math.max(0, 3 - cli.intentosFallidos)
        this.actualizarBadgeIntentos(restantes)
      }
    }
  }

  actualizarBadgeIntentos(restantes) {
    const badge = document.getElementById('intentos-badge')
    badge.textContent = `${restantes}/3`
    if (restantes === 0) {
      badge.className = 'px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold animate-pulse'
    } else {
      badge.className = 'px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold'
    }
  }

  cerrarSesion() {
    this.banco.usuarioActual = null
    this.actualizarBarraNavegacion()
    this.notificar('Has cerrado sesión en Mi Plata Financial Bank.', 'info')
    this.mostrarVista('vista-inicio')
  }

  renderizarPanelCajero() {
    const cliente = this.banco.usuarioActual
    if (!cliente) return

    document.getElementById('cajero-bienvenida').textContent = `Hola, ${cliente.nombre}`
    document.getElementById('cajero-detalles-cliente').textContent =
      `Cédula: ${cliente.identificacion} | Celular: ${cliente.celular} | Usuario: ${cliente.usuario}`

    const cuentas = this.banco.obtenerCuentasUsuario(cliente.usuario)
    const contenedor = document.getElementById('contenedor-cuentas')
    contenedor.innerHTML = ''

    cuentas.forEach((cta) => {
      const card = document.createElement('div')
      let gradientClass = 'bank-card-gradient-1'
      let icon = 'fa-piggy-bank'
      let labelMonto = 'Saldo Disponible'
      let montoValor = `$${cta.consultarSaldo().toLocaleString('es-CO')}`
      let extraInfo = ''

      if (cta instanceof CuentaAhorros) {
        gradientClass = 'bank-card-gradient-1'
        icon = 'fa-vault'
        extraInfo = '<span class="text-[11px] text-sky-200">Interés mensual: +1.5% en retiro</span>'
      } else if (cta instanceof CuentaCorriente) {
        gradientClass = 'bank-card-gradient-2'
        icon = 'fa-building-columns'
        const limite = cta.obtenerLimiteDisponible()
        extraInfo = `<span class="text-[11px] text-indigo-200">Límite c/ sobregiro: $${limite.toLocaleString('es-CO')}</span>`
      } else if (cta instanceof TarjetaCredito) {
        gradientClass = 'bank-card-gradient-3'
        icon = 'fa-credit-card'
        labelMonto = 'Cupo Disponible'
        extraInfo = `<span class="text-[11px] text-emerald-200">Deuda actual: $${cta.deudaTotal.toLocaleString('es-CO')}</span>`
      }

      card.className = `p-6 rounded-3xl ${gradientClass} text-white shadow-xl space-y-4 relative overflow-hidden`
      card.innerHTML = `
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="text-xs font-semibold uppercase tracking-wider text-slate-200">${cta.tipoNombre}</span>
                                <h3 class="text-sm font-mono font-bold tracking-widest opacity-90">${cta.numeroCuenta}</h3>
                            </div>
                            <i class="fa-solid ${icon} text-2xl opacity-80"></i>
                        </div>
                        <div class="pt-2">
                            <span class="text-xs text-slate-200 block">${labelMonto}</span>
                            <span class="text-2xl font-extrabold tracking-tight">${montoValor}</span>
                        </div>
                        <div class="pt-2 border-t border-white/10 flex justify-between items-center">
                            ${extraInfo}
                            <span class="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Activa</span>
                        </div>
                    `
      contenedor.appendChild(card)
    })

    // Cargar desplegables de formularios de transacciones
    this.cargarSelectCuentas()
    this.renderizarMovimientos()
  }

  cargarSelectCuentas() {
    const cliente = this.banco.usuarioActual
    if (!cliente) return

    const cuentas = this.banco.obtenerCuentasUsuario(cliente.usuario)

    const selectConsignar = document.getElementById('consignar-cuenta-select')
    const selectRetirar = document.getElementById('retirar-cuenta-select')
    const selectTransOrigen = document.getElementById('transfer-origen')
    const selectTransDestPropia = document.getElementById('transfer-destino-propia')
    const selectFiltroMovs = document.getElementById('filtro-movimientos-cuenta')

    const optionsHtml = cuentas
      .map((c) => `<option value="${c.numeroCuenta}">${c.tipoNombre} (${c.numeroCuenta})</option>`)
      .join('')

    selectConsignar.innerHTML = optionsHtml
    selectRetirar.innerHTML = optionsHtml
    selectTransOrigen.innerHTML = optionsHtml
    selectTransDestPropia.innerHTML = optionsHtml
    selectFiltroMovs.innerHTML = `<option value="todas">Todas mis cuentas</option>` + optionsHtml

    this.actualizarInfoRetiro()
  }

  actualizarInfoRetiro() {
    const numCta = document.getElementById('retirar-cuenta-select').value
    const cta = this.banco.obtenerCuentaPorNumero(numCta)
    const infoBox = document.getElementById('info-retiro-regla')

    if (!cta) return

    if (cta instanceof CuentaAhorros) {
      infoBox.innerHTML = `<i class="fa-solid fa-sparkles text-amber-400"></i> Cuenta de Ahorros: Aplica rendimiento mensual del <strong>1.5%</strong> acreditado en el retiro.`
    } else if (cta instanceof CuentaCorriente) {
      const limite = cta.obtenerLimiteDisponible()
      infoBox.innerHTML = `<i class="fa-solid fa-info-circle text-indigo-400"></i> Cuenta Corriente: Sobregiro del 20% permitido. Máximo que puede retirar hoy: <strong>$${limite.toLocaleString()}</strong>`
    } else if (cta instanceof TarjetaCredito) {
      infoBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-400"></i> Para retirar de tarjeta de crédito se considera avance de cupo.`
    }
  }

  cambiarTabTransaccion(tabId) {
    this.tabActual = tabId
    const tabs = ['tab-consignar', 'tab-retirar', 'tab-transferir', 'tab-credito', 'tab-movimientos', 'tab-perfil']
    tabs.forEach((t) => {
      const el = document.getElementById(t)
      if (el) el.classList.add('hidden')

      const btn = document.getElementById(`btn-${t}`)
      if (btn) {
        btn.className =
          'px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap text-slate-400 hover:text-white'
      }
    })

    document.getElementById(tabId).classList.remove('hidden')
    const activeBtn = document.getElementById(`btn-${tabId}`)
    if (activeBtn) {
      activeBtn.className =
        'px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap bg-cyan-600 text-white'
    }

    if (tabId === 'tab-perfil') {
      this.cargarFormPerfil()
    }
  }

  ejecutarConsignacion() {
    const numCta = document.getElementById('consignar-cuenta-select').value
    const monto = parseFloat(document.getElementById('consignar-monto').value)

    try {
      const cta = this.banco.obtenerCuentaPorNumero(numCta)
      cta.consignar(monto)
      this.banco.guardarEnStorage()
      this.notificar(`Consignación exitosa por $${monto.toLocaleString()} en la cuenta ${cta.numeroCuenta}`, 'exito')
      document.getElementById('consignar-monto').value = ''
      this.renderizarPanelCajero()
    } catch (err) {
      this.notificar(err.message, 'error')
    }
  }

  ejecutarRetiro() {
    const numCta = document.getElementById('retirar-cuenta-select').value
    const monto = parseFloat(document.getElementById('retirar-monto').value)

    try {
      const cta = this.banco.obtenerCuentaPorNumero(numCta)
      cta.retirar(monto)
      this.banco.guardarEnStorage()
      this.notificar(
        `Retiro procesado por $${monto.toLocaleString()}. Nuevo saldo: $${cta.consultarSaldo().toLocaleString()}`,
        'exito'
      )
      document.getElementById('retirar-monto').value = ''
      this.renderizarPanelCajero()
    } catch (err) {
      this.notificar(err.message, 'error')
    }
  }

  cambiarTipoTransferencia() {
    const tipo = document.getElementById('transfer-tipo').value
    const boxPropia = document.getElementById('box-dest-propia')
    const boxTerceros = document.getElementById('box-dest-terceros')

    if (tipo === 'propia') {
      boxPropia.classList.remove('hidden')
      boxTerceros.classList.add('hidden')
    } else {
      boxPropia.classList.add('hidden')
      boxTerceros.classList.remove('hidden')
    }
  }

  ejecutarTransferencia() {
    const tipoTrans = document.getElementById('transfer-tipo').value
    const numOrigen = document.getElementById('transfer-origen').value
    const monto = parseFloat(document.getElementById('transfer-monto').value)

    try {
      const ctaOrigen = this.banco.obtenerCuentaPorNumero(numOrigen)
      let ctaDestino

      if (tipoTrans === 'propia') {
        const numDestino = document.getElementById('transfer-destino-propia').value
        ctaDestino = this.banco.obtenerCuentaPorNumero(numDestino)
      } else {
        const numDestinoStr = document.getElementById('transfer-destino-terceros').value.trim()
        ctaDestino = this.banco.obtenerCuentaPorNumero(numDestinoStr)
        if (!ctaDestino) {
          throw new Error('La cuenta de destino especificada no existe.')
        }
      }

      // Ejecutar transferencia usando el método de la clase Cuenta
      ctaOrigen.transferir(monto, ctaDestino)
      this.banco.guardarEnStorage()

      this.notificar(`Transferencia de $${monto.toLocaleString()} completada con éxito.`, 'exito')
      document.getElementById('transfer-monto').value = ''
      this.renderizarPanelCajero()
    } catch (err) {
      this.notificar(err.message, 'error')
    }
  }

  recalcularCuotaTarjeta() {
    const monto = parseFloat(document.getElementById('credito-monto').value) || 0
    const cuotas = parseInt(document.getElementById('credito-cuotas').value) || 1
    const label = document.getElementById('val-cuota-resultante')

    if (monto <= 0 || cuotas <= 0) {
      label.textContent = '$0.00'
      return
    }

    const cuotaMensual = TarjetaCredito.calcularCuotaMensual(monto, cuotas)
    label.textContent = `$${Math.round(cuotaMensual).toLocaleString('es-CO')}/mes`
  }

  ejecutarCompraCredito() {
    const desc = document.getElementById('credito-descripcion').value.trim()
    const monto = parseFloat(document.getElementById('credito-monto').value)
    const cuotas = parseInt(document.getElementById('credito-cuotas').value)

    try {
      const cuentas = this.banco.obtenerCuentasUsuario(this.banco.usuarioActual.usuario)
      const tarCredito = cuentas.find((c) => c instanceof TarjetaCredito)

      if (!tarCredito) {
        throw new Error('No posees una Tarjeta de Crédito asignada.')
      }

      const cuotaMensual = tarCredito.comprar(monto, cuotas, desc)
      this.banco.guardarEnStorage()

      this.notificar(
        `Compra aprobada. Pago mensual: $${Math.round(cuotaMensual).toLocaleString()} por ${cuotas} cuotas.`,
        'exito'
      )
      document.getElementById('credito-descripcion').value = ''
      document.getElementById('credito-monto').value = ''
      this.renderizarPanelCajero()
    } catch (err) {
      this.notificar(err.message, 'error')
    }
  }

  renderizarMovimientos() {
    const cliente = this.banco.usuarioActual
    if (!cliente) return

    const filtro = document.getElementById('filtro-movimientos-cuenta').value
    const cuentas = this.banco.obtenerCuentasUsuario(cliente.usuario)

    let movimientos = []
    cuentas.forEach((c) => {
      if (filtro === 'todas' || c.numeroCuenta === filtro) {
        movimientos = movimientos.concat(c.movimientos)
      }
    })

    // Ordenar por fecha reciente
    movimientos.sort((a, b) => b.id - a.id)

    const tbody = document.getElementById('tabla-movimientos-body')
    tbody.innerHTML = ''

    if (movimientos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-500">No hay movimientos registrados en este filtro.</td></tr>`
      return
    }

    movimientos.forEach((m) => {
      const tr = document.createElement('tr')
      tr.className = 'hover:bg-slate-900/50 border-b border-slate-800/50'
      tr.innerHTML = `
                        <td class="px-4 py-3 text-slate-400 whitespace-nowrap">${m.fechaHora}</td>
                        <td class="px-4 py-3 font-mono font-bold text-slate-300">${m.numeroCuenta}</td>
                        <td class="px-4 py-3 font-semibold text-cyan-400">${m.tipo}</td>
                        <td class="px-4 py-3 text-slate-300">${m.descripcion}</td>
                        <td class="px-4 py-3 text-right font-bold text-white">$${m.monto.toLocaleString()}</td>
                        <td class="px-4 py-3 text-right font-mono text-emerald-400">$${m.saldoResultante.toLocaleString()}</td>
                    `
      tbody.appendChild(tr)
    })
  }

  cargarFormPerfil() {
    const c = this.banco.usuarioActual
    if (!c) return
    document.getElementById('perfil-identificacion').value = c.identificacion
    document.getElementById('perfil-celular').value = c.celular
    document.getElementById('perfil-nombre').value = c.nombre
  }

  actualizarPerfil() {
    const c = this.banco.usuarioActual
    if (!c) return

    c.identificacion = document.getElementById('perfil-identificacion').value.trim()
    c.celular = document.getElementById('perfil-celular').value.trim()
    c.nombre = document.getElementById('perfil-nombre').value.trim()

    this.banco.guardarEnStorage()
    this.actualizarBarraNavegacion()
    this.notificar('Datos de perfil actualizados correctamente.', 'exito')
  }

  cambiarPassword() {
    const c = this.banco.usuarioActual
    const passActual = document.getElementById('pass-actual').value
    const passNueva = document.getElementById('pass-nueva').value
    const passConf = document.getElementById('pass-confirmar').value

    if (!c.validarContrasena(passActual)) {
      this.notificar('La contraseña actual es incorrecta.', 'error')
      return
    }

    if (passNueva !== passConf) {
      this.notificar('La confirmación de contraseña no coincide.', 'error')
      return
    }

    c.contrasena = passNueva
    this.banco.guardarEnStorage()
    this.notificar('Contraseña actualizada con éxito.', 'exito')
    document.getElementById('pass-actual').value = ''
    document.getElementById('pass-nueva').value = ''
    document.getElementById('pass-confirmar').value = ''
  }

  calcularSimulacion() {
    const monto = parseFloat(document.getElementById('sim-monto').value)
    const cuotas = parseInt(document.getElementById('sim-cuotas').value)

    if (!monto || !cuotas) return

    const tasa = TarjetaCredito.calcularTasaInteres(cuotas)
    const pagoMensual = TarjetaCredito.calcularCuotaMensual(monto, cuotas)

    document.getElementById('sim-res-tasa').textContent = `${(tasa * 100).toFixed(1)}% mensual`
    document.getElementById('sim-res-cuotas').textContent = `${cuotas} meses`
    document.getElementById('sim-res-pago').textContent = `$${Math.round(pagoMensual).toLocaleString('es-CO')}`

    document.getElementById('resultado-simulador').classList.remove('hidden')
  }

  renderizarAdminCRUD() {
    const tbody = document.getElementById('tabla-admin-body')
    tbody.innerHTML = ''

    this.banco.clientes.forEach((cli) => {
      const tr = document.createElement('tr')
      tr.className = 'hover:bg-slate-900/50 border-b border-slate-800'

      const estadoBadge = cli.bloqueado
        ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">Bloqueado</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Activo</span>`

      tr.innerHTML = `
                        <td class="px-4 py-3 font-mono">${cli.identificacion}</td>
                        <td class="px-4 py-3 font-semibold text-white">${cli.nombre}</td>
                        <td class="px-4 py-3 text-cyan-300">${cli.usuario}</td>
                        <td class="px-4 py-3">${cli.celular}</td>
                        <td class="px-4 py-3">${estadoBadge}</td>
                        <td class="px-4 py-3 text-center space-x-2">
                            <button onclick="appController.abrirModalEditarUsuario('${cli.usuario}')" class="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                            ${cli.bloqueado ? `<button onclick="appController.desbloquearUsuario('${cli.usuario}')" class="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" title="Desbloquear"><i class="fa-solid fa-lock-open"></i></button>` : ''}
                            <button onclick="appController.eliminarUsuario('${cli.usuario}')" class="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    `
      tbody.appendChild(tr)
    })
  }

  abrirModalNuevoUsuario() {
    document.getElementById('modal-usuario-titulo').textContent = 'Agregar Nuevo Cliente (CRUD)'
    document.getElementById('modal-usuario-id-original').value = ''
    document.getElementById('modal-identificacion').value = ''
    document.getElementById('modal-nombre').value = ''
    document.getElementById('modal-celular').value = ''
    document.getElementById('modal-usuario-name').value = ''
    document.getElementById('modal-password').value = ''
    document.getElementById('modal-usuario').classList.remove('hidden')
  }

  abrirModalEditarUsuario(usuario) {
    const cli = this.banco.clientes.find((c) => c.usuario === usuario)
    if (!cli) return

    document.getElementById('modal-usuario-titulo').textContent = `Editar Cliente: ${cli.nombre}`
    document.getElementById('modal-usuario-id-original').value = cli.usuario
    document.getElementById('modal-identificacion').value = cli.identificacion
    document.getElementById('modal-nombre').value = cli.nombre
    document.getElementById('modal-celular').value = cli.celular
    document.getElementById('modal-usuario-name').value = cli.usuario
    document.getElementById('modal-password').value = ''
    document.getElementById('modal-usuario').classList.remove('hidden')
  }

  cerrarModalUsuario() {
    document.getElementById('modal-usuario').classList.add('hidden')
  }

  guardarUsuarioModal() {
    const origUser = document.getElementById('modal-usuario-id-original').value
    const id = document.getElementById('modal-identificacion').value.trim()
    const nombre = document.getElementById('modal-nombre').value.trim()
    const celular = document.getElementById('modal-celular').value.trim()
    const user = document.getElementById('modal-usuario-name').value.trim()
    const pass = document.getElementById('modal-password').value

    if (origUser === '') {
      // Crear
      try {
        this.banco.registrarCliente(id, nombre, celular, user, pass || '1234')
        this.notificar('Usuario agregado con sus productos bancarios.', 'exito')
      } catch (e) {
        this.notificar(e.message, 'error')
      }
    } else {
      // Editar
      const cli = this.banco.clientes.find((c) => c.usuario === origUser)
      if (cli) {
        cli.identificacion = id
        cli.nombre = nombre
        cli.celular = celular
        cli.usuario = user
        if (pass.trim() !== '') cli.contrasena = pass

        this.banco.guardarEnStorage()
        this.notificar('Cliente actualizado con éxito.', 'exito')
      }
    }

    this.cerrarModalUsuario()
    this.renderizarAdminCRUD()
  }

  desbloquearUsuario(usuario) {
    const cli = this.banco.clientes.find((c) => c.usuario === usuario)
    if (cli) {
      cli.desbloquear()
      this.banco.guardarEnStorage()
      this.notificar(`Cuenta de ${cli.nombre} desbloqueada.`, 'exito')
      this.renderizarAdminCRUD()
    }
  }

  eliminarUsuario(usuario) {
    // Confirmación visual utilizando diálogo modal/confirmación no nativa
    if (confirm(`¿Estás seguro de eliminar el cliente '${usuario}' y todas sus cuentas asociadas?`)) {
      this.banco.clientes = this.banco.clientes.filter((c) => c.usuario !== usuario)
      this.banco.cuentas = this.banco.cuentas.filter((c) => c.clienteUsuario !== usuario)
      this.banco.guardarEnStorage()
      this.notificar('Cliente eliminado del sistema.', 'info')
      this.renderizarAdminCRUD()
    }
  }
}
