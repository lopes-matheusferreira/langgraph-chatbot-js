#  Assistente Virtual 

Projeto desenvolvido como teste e demonstração pela empresa Optimus DataTechnology

**Solução de IA especializada** em processos legislativos e dados dos 55 vereadores da Câmara Municipal de São Paulo (19ª legislatura, 2025-2028). Projeto desenvolvido para o Pêndulo utilizando:

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs) 
![LangGraph](https://img.shields.io/badge/LangGraph-0.1.0-FF6D00?logo=langchain) 
![OpenAI](https://img.shields.io/badge/OpenAI-gpt4o-412991?logo=openai) 
![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?logo=redis)

##  Visão Geral
Sistema de diálogo inteligente que:
- Responde **perguntas específicas** sobre vereadores, partidos e projetos de lei
- Consulta **base de dados local** antes de responder
- Mantém **contexto de conversação** histórico
- Segue **regras rígidas** de confidencialidade e precisão

##  Núcleo de Inteligência
```mermaid
graph LR
    A[Pergunta] --> B{Análise de Contexto}
    B -->|Consulta| C[(FAISS Vector DB)]
    B -->|Otimização| D[GPT-3.5-turbo]
    C --> E[Documentos Relevantes]
    D --> F[Query Aprimorada]
    E --> G[GPT-4o]
    G --> H[Resposta Contextual]
