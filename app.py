from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# --- CONFIGURACIÓN SEGURA ---
# Usamos os.getenv para leer el token desde variables de entorno.
# En Render, configurarás una variable llamada NOTION_TOKEN con tu valor real.
NOTION_TOKEN = os.getenv("NOTION_TOKEN")

DB_PEDIDOS = "34379e11085d80469bafe18cdc560bdb" 
DB_INVENTARIO = "31879e11085d80f282befeb567a69374"
DB_OPINIONES = "34779e11085d807f934cd03a55e4bd68"

HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

# --- RUTAS DE NAVEGACIÓN ---
@app.route('/')
def index():
    url = f"https://api.notion.com/v1/databases/{DB_INVENTARIO}/query"
    
    payload = {
        "filter": {
            "property": "Disponible",
            "checkbox": {"equals": True}
        }
    }
    
    res = requests.post(url, headers=HEADERS, json=payload)
    categorias_dict = {}
    
    if res.status_code == 200:
        data = res.json().get("results", [])
        for item in data:
            props = item.get("properties", {})
            nombre = props.get("Nombre", {}).get("title", [{}])[0].get("plain_text", "Sin nombre")
            precio = props.get("Precio", {}).get("number", 0)
            categoria = props.get("Categoría", {}).get("select", {}).get("name", "Otros")
            
            imagen_url = "https://via.placeholder.com/300x200?text=Sin+Foto"
            img_list = props.get("Imagen", {}).get("files", [])
            if img_list:
                file_info = img_list[0]
                imagen_url = file_info.get("file", {}).get("url") if file_info.get("type") == "file" else file_info.get("external", {}).get("url")
            
            p_data = {"nombre": nombre, "precio": precio, "imagen": imagen_url}
            if categoria not in categorias_dict: categorias_dict[categoria] = []
            categorias_dict[categoria].append(p_data)
            
    return render_template('index.html', categorias=categorias_dict)

@app.route('/carrito')
def carrito(): return render_template('carrito.html')

@app.route('/entrega')
def datos_entrega(): return render_template('datos_de_entrega.html')

@app.route('/compra-completada')
def compra_completada(): return render_template('compra_completada.html')

# --- LÓGICA DE ENVÍO DE DATOS A NOTION ---

@app.route('/enviar_opinion', methods=['POST']) 
def enviar_opinion():
    try:
        datos = request.json
        payload = {
            "parent": {"database_id": DB_OPINIONES},
            "properties": {
                "Estrellas": {"number": int(datos.get('rating', 0))},
                "Sugerencia": {"title": [{"text": {"content": str(datos.get('sugerencia', 'Sin sugerencia'))}}]}
            }
        }
        res = requests.post("https://api.notion.com/v1/pages", headers=HEADERS, json=payload)
        return jsonify({"success": res.status_code == 200})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/enviar-pedido', methods=['POST'])
def enviar_pedido():
    try:
        datos = request.json
        carrito = datos.get('carrito', [])
        texto_pedido = "🛒 DETALLE DEL PEDIDO:\n"
        total_pago = sum(item['precio'] * item.get('cantidad', 1) for item in carrito)
        
        for item in carrito:
            texto_pedido += f"• {item['nombre']} x{item.get('cantidad', 1)} (${item['precio'] * item.get('cantidad', 1)})\n"
        
        texto_pedido += f"\n💰 TOTAL NETO: ${total_pago}"

        payload = {
            "parent": {"database_id": DB_PEDIDOS},
            "properties": {
                "Name": {"title": [{"text": {"content": datos.get('nombre')}}]},
                "Description": {"rich_text": [{"text": {"content": texto_pedido}}]},
                "Correo": {"email": datos.get('correo') or "sin@correo.com"},
                "Telefono": {"phone_number": str(datos.get('telefono') or "")},
                "Ubicación": {"rich_text": [{"text": {"content": datos.get('ubicacion')}}]},
                "GPS": {"rich_text": [{"text": {"content": datos.get('gps')}}]},
                "Total": {"number": float(total_pago)},
                "Metodo Pago": {"select": {"name": datos.get('metodo', 'Efectivo').capitalize()}},
                "Paga con": {"number": float(datos.get('paga_con') or 0)}
            }
        }
        res = requests.post("https://api.notion.com/v1/pages", headers=HEADERS, json=payload)
        return jsonify({"status": "success" if res.status_code == 200 else "error"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)