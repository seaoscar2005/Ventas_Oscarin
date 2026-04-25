import requests
import json
import uuid
from datetime import datetime

# --- CONFIGURACIÓN ---
NOTION_TOKEN = "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"
DB_PEDIDOS = "31879e11085d803e9805fb57e7ecf366"
DB_DETALLES = "31879e11085d80218a19cf1153a26bfe"

headers = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28" # <--- ACTUALIZADO: La versión que te pide el error
}

def registrar_venta_completa(cliente, ubicacion, paga_con, carrito):
    id_venta = str(uuid.uuid4())[:8] 
    total_venta = sum(item['precio'] * item['cantidad'] for item in carrito)
    url_pages = "https://api.notion.com/v1/pages"

    # 1. Registrar el Pedido Principal
    payload_pedido = {
        "parent": {"database_id": DB_PEDIDOS},
        "properties": {
            "Name": {"title": [{"text": {"content": f"Venta #{id_venta} - {cliente}"}}]},
            "Cliente": {"rich_text": [{"text": {"content": cliente}}]},
            "Ubicación": {"rich_text": [{"text": {"content": ubicacion}}]},
            "Monto a pagar": {"number": total_venta},
            "Paga con": {"number": paga_con}
        }
    }
    
    resp_p = requests.post(url_pages, headers=headers, data=json.dumps(payload_pedido))
    
    if resp_p.status_code == 200:
        print(f"✅ Pedido Maestro creado exitosamente.")
    else:
        print(f"❌ ERROR en Pedido: {resp_p.status_code} - {resp_p.text}")

    # 2. Registrar cada producto
    for producto in carrito:
        payload_detalle = {
            "parent": {"database_id": DB_DETALLES},
            "properties": {
                # CAMBIÉ 'Name' por 'Item' porque tu error dice que 'Name' no existe en esa tabla
                "Item": {"title": [{"text": {"content": f"Venta {id_venta}"}}]}, 
                "Producto": {"select": {"name": producto['nombre']}},
                "Cantidad": {"number": producto['cantidad']},
                "Precio Unitario": {"number": producto['precio']},
                "ID de Venta": {"rich_text": [{"text": {"content": id_venta}}]}
            }
        }
        resp_d = requests.post(url_pages, headers=headers, data=json.dumps(payload_detalle))
        if resp_d.status_code == 200:
            print(f"   - {producto['nombre']} agregado.")
        else:
            print(f"   - ❌ ERROR en {producto['nombre']}: {resp_d.status_code} - {resp_d.text}")

# --- SIMULACIÓN ---
mi_carrito = [
    {"nombre": "Sauris", "precio": 5, "cantidad": 2},
    {"nombre": "Santa Clara Fresa", "precio": 15, "cantidad": 1},
    {"nombre": "Canelitas", "precio": 8, "cantidad": 3}
]

registrar_venta_completa("Oscar Hernandez", "Tierra Blanca", 100, mi_carrito)