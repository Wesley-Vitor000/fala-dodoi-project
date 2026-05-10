from flask import Flask, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route("/")
def inicio():
    return "API de Alertas do Fala Dodoi Triagem"


# Aqui, criamos um endpoint para receber os alertas enviados pelo frontend. Ele espera receber um JSON com as informações do alerta, que são então armazenadas em um arquivo chamado "alertas.json". Cada novo alerta é adicionado à lista existente de alertas no arquivo. O endpoint retorna uma mensagem de sucesso após salvar o alerta.
@app.route("/alerta", methods=["POST"])
def criar_alerta():
    dados = request.get_json()

    with open("alertas.json", "r") as arquivo:
        alertas = json.load(arquivo)

    alertas.append(dados)

    with open("alertas.json", "w") as arquivo:
        json.dump(alertas, arquivo, indent=4)

    return {"message": "Alerta criado com sucesso!"}, 201

# Aqui, criamos um endpoint para retornar a lista de alertas armazenados no arquivo "alertas.json". Ele lê o conteúdo do arquivo e retorna os alertas como uma resposta JSON. Esse endpoint pode ser acessado pelo frontend para exibir os alertas no painel.
@app.route("/alertas", methods=["GET"])
def listar_alertas():

    with open("alertas.json", "r") as arquivo:
        alertas = json.load(arquivo)

    return {"alertas": alertas}

if __name__ == "__main__":
    app.run(debug=True)