from flask import Flask, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Caminhos seguros dos arquivos JSON dentro da pasta api
BASE_DIR = os.path.dirname(__file__)

ARQUIVO_ALERTAS = os.path.join(BASE_DIR, "alertas.json")
ARQUIVO_COMISSAO = os.path.join(BASE_DIR, "alertas_comissao.json")


def garantir_arquivo_json(caminho):
    """
    Garante que o arquivo JSON existe e está válido.
    Se não existir ou estiver quebrado, cria uma lista vazia [].
    """
    try:
        with open(caminho, "r", encoding="utf-8") as arquivo:
            json.load(arquivo)
    except:
        with open(caminho, "w", encoding="utf-8") as arquivo:
            json.dump([], arquivo, indent=4, ensure_ascii=False)


@app.route("/")
def inicio():
    return "API de Alertas do Fala Dodoi Triagem"


# =====================================================
# ROTAS DO PAINEL GERAL DE ALERTAS
# =====================================================

@app.route("/alerta", methods=["POST"])
def criar_alerta():
    garantir_arquivo_json(ARQUIVO_ALERTAS)

    dados = request.get_json()

    with open(ARQUIVO_ALERTAS, "r", encoding="utf-8") as arquivo:
        alertas = json.load(arquivo)

    alertas.append(dados)

    with open(ARQUIVO_ALERTAS, "w", encoding="utf-8") as arquivo:
        json.dump(alertas, arquivo, indent=4, ensure_ascii=False)

    return {"message": "Alerta criado com sucesso!"}, 201


@app.route("/alertas", methods=["GET"])
def listar_alertas():
    garantir_arquivo_json(ARQUIVO_ALERTAS)

    with open(ARQUIVO_ALERTAS, "r", encoding="utf-8") as arquivo:
        alertas = json.load(arquivo)

    return {"alertas": alertas}


@app.route("/alertas", methods=["DELETE"])
def limpar_alertas():
    with open(ARQUIVO_ALERTAS, "w", encoding="utf-8") as arquivo:
        json.dump([], arquivo, indent=4, ensure_ascii=False)

    return {"message": "Alertas removidos com sucesso"}


# =====================================================
# ROTAS DA COMISSÃO DE DOR
# =====================================================

@app.route("/alerta-comissao", methods=["POST"])
def criar_alerta_comissao():
    garantir_arquivo_json(ARQUIVO_COMISSAO)

    dados = request.get_json()

    with open(ARQUIVO_COMISSAO, "r", encoding="utf-8") as arquivo:
        alertas = json.load(arquivo)

    # Insere no começo da lista para o alerta mais recente aparecer primeiro
    alertas.insert(0, dados)

    with open(ARQUIVO_COMISSAO, "w", encoding="utf-8") as arquivo:
        json.dump(alertas, arquivo, indent=4, ensure_ascii=False)

    return {"message": "Alerta enviado para Comissão de Dor"}, 201


@app.route("/alertas-comissao", methods=["GET"])
def listar_alertas_comissao():
    garantir_arquivo_json(ARQUIVO_COMISSAO)

    with open(ARQUIVO_COMISSAO, "r", encoding="utf-8") as arquivo:
        alertas = json.load(arquivo)

    return {"alertas": alertas}


@app.route("/alertas-comissao", methods=["DELETE"])
def limpar_alertas_comissao():
    with open(ARQUIVO_COMISSAO, "w", encoding="utf-8") as arquivo:
        json.dump([], arquivo, indent=4, ensure_ascii=False)

    return {"message": "Alertas da Comissão removidos com sucesso"}


@app.route("/alerta-comissao/<int:id_alerta>", methods=["DELETE"])
def finalizar_alerta_comissao(id_alerta):
    garantir_arquivo_json(ARQUIVO_COMISSAO)

    with open(ARQUIVO_COMISSAO, "r", encoding="utf-8") as arquivo:
        alertas = json.load(arquivo)

    alertas_atualizados = [
        alerta for alerta in alertas
        if int(alerta.get("id", 0)) != id_alerta
    ]

    with open(ARQUIVO_COMISSAO, "w", encoding="utf-8") as arquivo:
        json.dump(alertas_atualizados, arquivo, indent=4, ensure_ascii=False)

    return {"message": "Atendimento finalizado e removido da fila"}


if __name__ == "__main__":
    app.run(debug=True)
