// 1. Inicialización de datos desde el LocalStorage
let datosCrudos = JSON.parse(localStorage.getItem('carrito_usuario')) || [];
let carritoMap = {};

// Agrupamos los productos para manejar cantidades y mostrar imágenes
datosCrudos.forEach(p => {
    if (carritoMap[p.nombre]) {
        carritoMap[p.nombre].cantidad += 1;
    } else {
        carritoMap[p.nombre] = { ...p, cantidad: 1 };
    }
});

/**
 * Función principal para renderizar los productos en el HTML
 */
function renderCarrito() {
    const main = document.getElementById('lista-carrito-detallada');
    let totalGeneral = 0;
    let piezasTotales = 0;
    let keys = Object.keys(carritoMap);
    
    // Si el carrito está vacío, mostramos mensaje y reseteamos indicadores
    if (keys.length === 0) {
        main.innerHTML = `<h2 style="text-align:center; padding:50px;">Tu carrito está vacío</h2>`;
        actualizarIndicadores(0, 0);
        return;
    }

    // Generamos el HTML para cada item en el carrito
    main.innerHTML = keys.map(nombre => {
        let p = carritoMap[nombre];
        let subtotal = p.precio * p.cantidad;
        totalGeneral += subtotal;
        piezasTotales += p.cantidad;
        
        return `
            <div class="item-pedido" style="display:flex; align-items:center; padding:20px; background:white; margin-bottom:15px; border-radius:15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <img src="${p.imagen}" class="mini-imagen-carrito" onerror="this.src='https://via.placeholder.com/80?text=S/F'">
                
                <div style="flex: 1;">
                    <h3 style="margin:0; font-size:1.2rem;">${p.nombre}</h3>
                    <span style="color:#27ae60; font-weight:bold;">$${p.precio} c/u</span>
                </div>

                <div style="display:flex; align-items:center; gap:15px; border:1px solid #ddd; padding:5px 15px; border-radius:10px;">
                    <button onclick="cambiarCantidad('${p.nombre}', -1)" style="border:none; background:none; cursor:pointer; font-size:1.5rem; font-weight:bold;">-</button>
                    <span style="font-weight:bold; min-width:25px; text-align:center;">${p.cantidad}</span>
                    <button onclick="cambiarCantidad('${p.nombre}', 1)" style="border:none; background:none; cursor:pointer; font-size:1.5rem; font-weight:bold;">+</button>
                </div>

                <button class="btn-eliminar-item" onclick="eliminarProductoCompleto('${p.nombre}')" title="Eliminar producto">
                    <i class="fas fa-trash-alt"></i>
                </button>

                <div style="margin-left:20px; min-width:80px; text-align:right;">
                    <b style="font-size:1.2rem;">$${subtotal}</b>
                </div>
            </div>
        `;
    }).join('');
    
    actualizarIndicadores(totalGeneral, piezasTotales);
}

/**
 * Actualiza los textos de los totales en el cuadro de resumen
 */
function actualizarIndicadores(total, piezas) {
    const subtotalElem = document.getElementById('subtotal-dinero');
    const totalElem = document.getElementById('total-final');
    const cantElem = document.getElementById('cant-productos-total');

    if(subtotalElem) subtotalElem.innerText = `$${total}`;
    if(totalElem) totalElem.innerText = `$${total}`;
    if(cantElem) cantElem.innerText = piezas;
}

/**
 * Suma o resta una unidad a un producto específico
 */
function cambiarCantidad(nombre, cambio) {
    if (carritoMap[nombre]) {
        carritoMap[nombre].cantidad += cambio;
        if (carritoMap[nombre].cantidad <= 0) delete carritoMap[nombre];
        actualizarMemoriaYRender();
    }
}

/**
 * Elimina por completo un producto del mapa, sin importar la cantidad
 */
function eliminarProductoCompleto(nombre) {
    if (confirm(`¿Quitar todos los "${nombre}" del carrito?`)) {
        delete carritoMap[nombre];
        actualizarMemoriaYRender();
    }
}

/**
 * Sincroniza el estado actual de carritoMap con el LocalStorage y refresca la vista
 */
function actualizarMemoriaYRender() {
    let listaSimple = [];
    Object.values(carritoMap).forEach(p => {
        for(let i=0; i < p.cantidad; i++) {
            listaSimple.push({nombre: p.nombre, precio: p.precio, imagen: p.imagen});
        }
    });
    localStorage.setItem('carrito_usuario', JSON.stringify(listaSimple));
    renderCarrito();
}

/**
 * Redirecciona a la página de datos de entrega
 */
function irAFormulario() {
    let datos = JSON.parse(localStorage.getItem('carrito_usuario')) || [];
    if (datos.length === 0) {
        alert("Agrega productos antes de continuar");
        return;
    }
    // Redirige a la ruta configurada en app.py
    window.location.href = "/datos-entrega";
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', renderCarrito);