// Variables globales para el mapa
let mapa;
let marcador;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a elementos del DOM
    const btnAbrirMapa = document.getElementById('btn-abrir-mapa');
    const btnGuardarGPS = document.getElementById('btn-guardar-gps');
    const mapaWrapper = document.getElementById('mapa-contenedor-wrapper');
    const metodoPago = document.getElementById('metodo_pago');
    const divPagaCon = document.getElementById('div_paga_con');
    const btnConfirmar = document.getElementById('btn-confirmar-pedido');
    const inputGPS = document.getElementById('coordenadas_gps');

    // 2. Lógica del selector de Pago (Efectivo vs Crédito)
    metodoPago.addEventListener('change', () => {
        if (metodoPago.value === 'efectivo') {
            divPagaCon.style.display = 'block';
        } else {
            divPagaCon.style.display = 'none';
        }
    });

    // 3. Lógica del Mapa (Leaflet)
    btnAbrirMapa.addEventListener('click', () => {
        mapaWrapper.style.display = 'block';
        btnAbrirMapa.style.display = 'none'; 

        if (!mapa) {
            // Coordenadas exactas en Tierra Blanca
            const latTB = 18.436229;
            const lngTB = -96.344170;

            mapa = L.map('mapa-contenedor').setView([latTB, lngTB], 17);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapa);

            marcador = L.marker([latTB, lngTB]).addTo(mapa);
            inputGPS.value = `${latTB},${lngTB}`;

            mapa.on('click', (e) => {
                const { lat, lng } = e.latlng;
                marcador.setLatLng([lat, lng]);
                inputGPS.value = `${lat},${lng}`;
            });

            setTimeout(() => {
                mapa.invalidateSize();
            }, 300);
        }
    });

    // 4. Lógica de Guardar GPS
    btnGuardarGPS.addEventListener('click', () => {
        if (inputGPS.value) {
            mapaWrapper.style.display = 'none';
            btnAbrirMapa.style.display = 'block';
            
            btnAbrirMapa.innerHTML = '<i class="fas fa-check-circle"></i> Ubicación Guardada con éxito';
            btnAbrirMapa.style.backgroundColor = '#e8f5e9';
            btnAbrirMapa.style.color = '#2e7d32';
            btnAbrirMapa.style.borderColor = '#2e7d32';
        }
    });

    // 5. Lógica de Confirmación Final con TODAS las validaciones
    btnConfirmar.addEventListener('click', () => {
        const correo = document.getElementById('correo_cliente').value.trim();
        const nombre = document.getElementById('nombre_cliente').value.trim();
        const telefono = document.getElementById('telefono_cliente').value.trim();
        const ubicacion = document.getElementById('ubicacion_escrita').value.trim();
        const gps = inputGPS.value;
        const metodo = metodoPago.value;
        const pagaCon = document.getElementById('paga_con').value;
        const carrito = JSON.parse(localStorage.getItem('carrito_usuario')) || [];

        // REGLAS DE VALIDACIÓN OBLIGATORIAS
        if (correo === "") {
            alert("⚠️ El correo es necesario para tu recibo.");
            return;
        }
        if (nombre === "") {
            alert("⚠️ Ingresa tu nombre completo.");
            return;
        }
        if (telefono === "" || telefono.length < 10) {
            alert("⚠️ Ingresa un número de teléfono válido (10 dígitos).");
            return;
        }
        if (ubicacion === "") {
            alert("⚠️ Danos una referencia de entrega (Lugar o Salón).");
            return;
        }
        if (!gps) {
            alert("📍 Es obligatorio marcar tu ubicación en el mapa.");
            return;
        }
        if (metodo === 'efectivo' && (pagaCon === "" || pagaCon <= 0)) {
            alert("💵 Indica con cuánto vas a pagar para llevarte cambio.");
            return;
        }
        if (carrito.length === 0) {
            alert("🛒 Tu carrito está vacío.");
            return;
        }

        const datosEntrega = {
            correo: correo,
            nombre: nombre,
            telefono: telefono,
            ubicacion: ubicacion,
            gps: gps,
            metodo: metodo,
            paga_con: pagaCon,
            carrito: carrito
        };

        enviarPedidoANotion(datosEntrega);
    });
});

function enviarPedidoANotion(datos) {
    const btn = document.getElementById('btn-confirmar-pedido');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btn.disabled = true;

    fetch('/enviar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            localStorage.removeItem('carrito_usuario');
            window.location.href = "/compra-completada";
        } else {
            alert("❌ Error al enviar a Notion.");
            btn.innerHTML = 'CONFIRMAR Y ENVIAR PEDIDO';
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("❌ Error de red.");
        btn.disabled = false;
    });
}