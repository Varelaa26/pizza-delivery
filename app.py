from flask import Flask, render_template, jsonify, request, redirect
from flask_cors import CORS 
import json
import os

app = Flask(__name__)
CORS(app)
 
pedidos = []

def carregar_pedidos():
    global pedidos
    if os.path.exists('pedidos.json'):
        with open('pedidos.json', 'r', encoding='utf-8') as f:
            pedidos = json.load(f)

def salvar_pedidos():
    with open('pedidos.json', 'w', encoding='utf-8') as f:
        json.dump(pedidos, f, indent=4)

carregar_pedidos()

@app.route('/api/pedidos-form', methods=['POST'])
def receber_pedido_form():
    dados_pedido = {
        'tamanho': request.form.get('tamanho'),
        'sabores': request.form.get('sabores'),
        'refrigerante': request.form.get('refrigerante'),
        'molho': request.form.get('molho'),
        'observacoes': request.form.get('observacoes'),
        'hora': request.form.get('hora', 'N/A')
    }

    if not dados_pedido['tamanho']:
        return "Dados do pedido ausentes", 400

    dados_pedido['id'] = len(pedidos) + 1
    dados_pedido['status'] = 'Aguardando Preparo'

    pedidos.append(dados_pedido)
    salvar_pedidos()

    return redirect('/')

@app.route('/api/pedidos', methods=['GET'])
def listar_pedidos():
    return jsonify(pedidos), 200

@app.route('/api/pedidos/<int:pedido_id>/status', methods=['PATCH'])
def atualizar_status(pedido_id):
    dados = request.get_json()
    novo_status = dados.get('status')
    
    for pedido in pedidos:
        if pedido['id'] == pedido_id:
            pedido['status'] = novo_status
            salvar_pedidos()
            return jsonify({"mensagem": "Status atualizado", "pedido": pedido}), 200
    
    return jsonify({"mensagem": "Pedido não encontrado"}), 404

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home.html')
def home():
    return render_template('home.html')

@app.route('/revisão.html')
def revisao():
    return render_template('revisão.html')

@app.route('/pedidos.html')
def painel_pedidos():
    return render_template('pedidos.html')

if __name__ == '__main__':

    app.run(debug=True, host='0.0.0.0', port=5000)




