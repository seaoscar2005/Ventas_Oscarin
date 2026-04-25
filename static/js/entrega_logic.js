// --- LÓGICA DE ENTREGA, MAPA Y ENVÍO A NOTION V7.0 (RESPALDO) ---
let mapa;
let marcador;
let coordenadasSeleccionadas = null;

/**
 * Manejo del Modal y Librería Leaflet
 */
function abrirMapa() {
    const modal = document.getElementById('modal-mapa');
    modal.style.display = 'block';
    
    setTimeout(() => {
        if (!mapa) {
            console.log("Iniciando mapa...");
            mapa = L.map('map').setView([18.4439, -96.3564], 16); 
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(mapa);
            
            mapa.on('click', function(e) {
                posicionarMarcador(e.latlng.lat, e.latlng.lng);
            });
        } else {
            mapa.invalidateSize();
        }
        detectarGpsActual();
    }, 300); 
}

function detectarGpsActual() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            mapa.setView([latitude, longitude], 18);
            posicionarMarcador(latitude, longitude);
        }, (error) => {
            console.warn("GPS no disponible:", error.message);
        });
    }
}

function posicionarMarcador(lat, lng) {
    if (marcador) {
        marcador.setLatLng([lat, lng]);
    } else {
        marcador = L.marker([lat, lng], { draggable: true }).addTo(mapa);
    }
    coordenadasSeleccionadas = `${lat},${lng}`;
}

function confirmarUbicacion() {
    if (coordenadasSeleccionadas) {
        document.getElementById('gps-datos').value = coordenadasSeleccionadas;
        const indicador = document.getElementById('indicador-ubicacion');
        indicador.style.display = 'block';
        indicador.innerHTML = `<i class="fas fa-check-circle"></i> Ubicación capturada con éxito`;
        cerrarMapa();
    } else {
        alert("Por favor, selecciona un punto en el mapa.");
    }
}

function cerrarMapa() {
    document.getElementById('modal-mapa').style.display = 'none';
}

/**
 * Envío de Formulario Final a Flask (app.py)
 * Se ha eliminado la Dirección para simplificar el envío.
 */
async function enviarPedidoFinal() {
    const btn = document.querySelector('.btn-finalizar-pedido');
    
    // 1. Recolección de campos (Sin el campo de dirección)
    const datosPedido = {
        nombre: document.getElementById('nombre-cliente').value.trim(),
        correo: document.getElementById('correo-cliente').value.trim(),
        telefono: document.getElementById('telefono-cliente').value.trim(),
        ubicacion: document.getElementById('ubicacion-referencia').value.trim(), // Esta es la referencia (ej: salón)
        gps: document.getElementById('gps-datos').value,
        metodo: document.getElementById('metodo-pago').value,
        paga_con: document.getElementById('paga-con') ? document.getElementById('paga-con').value : 0,
        carrito: JSON.parse(localStorage.getItem('carrito_usuario')) || []
    };

    // 2. Validaciones Críticas (Se eliminó la validación de dirección)
    if (!datosPedido.nombre || !datosPedido.gps) {
        alert("⚠️ Por favor completa: Nombre y Ubicación en el mapa.");
        return;
    }

    if (datosPedido.carrito.length === 0) {
        alert("🛒 Tu carrito está vacío.");
        return;
    }

    // 3. Feedback visual
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';

    try {
        // 4. Petición al servidor Python
        const respuesta = await fetch('/enviar-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        const resultado = await respuesta.json();

        if (resultado.status === 'success') {
            localStorage.removeItem('carrito_usuario');
            window.location.href = '/compra-completada';
        } else {
            throw new Error(resultado.message || "Error al procesar el pedido");
        }
    } catch (error) {
        console.error("Error en el envío:", error);
        alert("❌ Error: No se pudo enviar el pedido. Revisa tu conexión.");
        btn.disabled = false;
        btn.innerHTML = 'CONFIRMAR PEDIDO <i class="fas fa-check-double"></i>';
    }
}