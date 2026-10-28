# Fala Dodói — Interface de Avaliação e Comunicação da Dor

**Projeto acadêmico em desenvolvimento** · Aplicação web com front-end e API em Python

O **Fala Dodói** explora uma forma visual de apoiar a **comunicação de dor e desconforto** por pessoas com dificuldades de comunicação verbal, incluindo pacientes com transtorno do espectro autista (TEA). O projeto reúne etapas de registro, seleção da região do corpo, intensidade, descrição do desconforto e visualização de alertas.

## O que o projeto demonstra

- Criação de páginas web com **HTML, CSS e JavaScript**.
- Interface pensada para uso em telas pequenas e fluxo guiado por etapas.
- Comunicação entre front-end e uma **API REST com Flask**.
- Painel para acompanhamento de alertas e fluxo específico de comissão de dor.
- Organização de funcionalidades em módulos e integração entre páginas.

## Estrutura do repositório

| Pasta | Finalidade |
| --- | --- |
| `01-identificacao/` a `07-documento-final/` | Etapas de coleta e organização de informações |
| `08-painel-alertas/` | Visualização e gerenciamento de alertas |
| `09-alerta-comissao-dor/` | Fluxo relacionado à comissão de dor |
| `login-*/` | Interfaces de entrada por perfil |
| `api/` | Serviço Flask e persistência em arquivos JSON |
| `assets/` | Recursos compartilhados da interface |

## Tecnologias

- **Front-end:** HTML5, CSS3 e JavaScript.
- **Back-end:** Python, Flask, Flask-CORS e Gunicorn.
- **Persistência atual:** arquivos JSON para alertas.
- **Arquitetura:** páginas web integradas a endpoints HTTP.

## Executar a API localmente

Com Python 3 instalado, na pasta `api/`:

```bash
pip install -r requirements.txt
python app.py
```

A aplicação Flask disponibiliza rotas como `GET /alertas`, `POST /alerta`, `GET /alertas-comissao` e `POST /alerta-comissao`. As páginas web estão organizadas nas pastas de cada etapa.

## Limitações e próximos passos

Esta é uma **demonstração acadêmica**, não um dispositivo médico nem um sistema clinicamente validado. O código atual **não deve ser usado com dados reais de pacientes em produção** sem controles adicionais de autenticação, autorização, privacidade, persistência segura, auditoria e validação clínica.

Prioridades de evolução: segurança da API, proteção de dados, testes, acessibilidade e documentação dos fluxos.

---

Desenvolvido por [Wesley Vitor](https://github.com/Wesley-Vitor000) para fins acadêmicos e de aprendizado em desenvolvimento de software.
