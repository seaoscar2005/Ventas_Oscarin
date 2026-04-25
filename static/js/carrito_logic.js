// --- LÓGICA DEL CARRITO V6.6.1 (CANTIDADES Y RESUMEN EXACTO) ---
let carrito = JSON.parse(localStorage.getItem('carrito_usuario')) || [];

window.onload = () => {
    actualizarContador();
    if (document.getElementById('lista-carrito')) {
        renderizarCarrito();
    }
};

/**
 * Agrega un producto manejando cantidades acumuladas
 */
function agregarProducto(nombre, precio, imagen) {
    const productoExistente = carrito.find(p => p.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    localStorage.setItem('carrito_usuario', JSON.stringify(carrito));
    actualizarContador();
}

/**
 * Actualiza el badge del contador (Suma total de todas las piezas)
 */
function actualizarContador() {
    const badge = document.getElementById('contador');
    if (badge) {
        const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);
        badge.innerText = totalItems;
    }
}

/**
 * Dibuja el carrito y calcula el resumen de orden
 */
function renderizarCarrito() {
    const contenedor = document.getElementById('lista-carrito');
    const subtotalTxt = document.getElementById('subtotal-items');
    const totalTxt = document.getElementById('total-precio');
    
    if (!contenedor) return;

    contenedor.innerHTML = ''; 
    let sumaTotalDinero = 0;
    let sumaTotalPiezas = 0;

    carrito.forEach((p, index) => {
        sumaTotalDinero += (p.precio * p.cantidad);
        sumaTotalPiezas += p.cantidad;

        contenedor.innerHTML += `
            <div class="item-carrito">
                <div class="info-principal">
                    <img src="${p.imagen}" class="img-carrito-grande">
                    <div class="item-detalles">
                        <h4 class="nombre-carrito-pro">${p.nombre}</h4>
                        <p class="precio-carrito-pro">$${p.precio}</p>
                    </div>
                </div>
                
                <div class="controles-derecha">
                    <div class="controles-cantidad">
                        <button class="btn-qty" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span class="qty-num">${p.cantidad}</span>
                        <button class="btn-qty" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>

                </div>
            </div>
        `;
    });

    if (subtotalTxt) subtotalTxt.innerText = sumaTotalPiezas;
    if (totalTxt) totalTxt.innerText = `$${sumaTotalDinero}`;
}
/**
 * Incrementa o reduce la cantidad de un item
 */
function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad <= 0) {
        eliminarDelCarrito(index);
    } else {
        localStorage.setItem('carrito_usuario', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContador();
    }
}

/**
 * Elimina un producto por completo
 */
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito_usuario', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContador();
}

/**
 * Redirección al carrito
 */
function irAlCarrito() {
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío! Agrega algo rico primero.");
        return;
    }
    window.location.href = "/carrito"; 
}

/**
 * Redirección a la página de entrega
 */
function irAEntrega() {
    if (carrito.length === 0) {
        alert("Agrega productos antes de continuar.");
        return;
    }
    window.location.href = "/entrega";
}


/**
 * Redirige a la página de datos de entrega
 */
function irAEntrega() {
    // Verificamos si hay algo en el carrito antes de dejarlo pasar
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío! Agrega algo antes de continuar.");
        return;
    }
    
    // Esta es la ruta que debe coincidir con tu archivo de Python (app.py)
    window.location.href = "/entrega"; 
}