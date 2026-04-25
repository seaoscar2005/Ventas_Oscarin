document.addEventListener('DOMContentLoaded', () => {
    const estrellas = document.querySelectorAll('#rating-container i');
    const btnEnviar = document.getElementById('btn-enviar-opinion');
    const bloqueEncuesta = document.getElementById('bloque-encuesta');
    const mensajeGracias = document.getElementById('mensaje-gracias-encuesta');
    
    let puntaje = 0;

    // 1. Lógica para iluminar las estrellas al hacer clic
    estrellas.forEach(estrella => {
        estrella.addEventListener('click', () => {
            puntaje = estrella.getAttribute('data-value');
            console.log("Puntaje seleccionado:", puntaje);
            
            // Pintar las estrellas hasta la seleccionada
            estrellas.forEach(s => {
                s.classList.remove('active');
                if (s.getAttribute('data-value') <= puntaje) {
                    s.classList.add('active');
                }
            });
        });
    });

    // 2. Lógica del botón Enviar Opinión
    btnEnviar.addEventListener('click', () => {
        const sugerencia = document.getElementById('sugerencia-producto').value.trim();

        // Validación: Obligar a seleccionar estrellas
        if (puntaje === 0) {
            alert("⚠️ Por favor, selecciona una puntuación con las estrellas.");
            return;
        }

        const datosEncuesta = {
            puntuacion: puntaje,
            sugerencia: sugerencia
        };

        // Estado de carga en el botón
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btnEnviar.disabled = true;

        // Enviamos los datos a Python (luego configuraremos app.py)
        fetch('/guardar-encuesta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosEncuesta)
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                // Ocultamos la encuesta y mostramos el mensaje de gracias final
                bloqueEncuesta.style.display = 'none';
                mensajeGracias.style.display = 'block';
            } else {
                alert("Hubo un detalle al guardar tu opinión. ¡Gracias de todas formas!");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            // Si falla la red, igual mostramos gracias para no arruinar la experiencia
            bloqueEncuesta.style.display = 'none';
            mensajeGracias.style.display = 'block';
        });
    });
});