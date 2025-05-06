require("dotenv").config();
const fs = require("fs");
const path = require("node:path");
const { Document } = require("@langchain/core/documents"); 
const DATABASE_DIRECTORY = path.join(process.cwd(), "database");
const DOCS_PATH = path.join(DATABASE_DIRECTORY, "docs.json"); 

async function loadDocumentsFromJson(filePath) {
  console.log(`Processando arquivo JSON: ${filePath}`);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    const documents = [];
    const fileName = path.basename(filePath);

    if (fileName === 'faq.json') {
      for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i]; 
        if (item.question && item.answer) {
          const pageContent = `Pergunta: ${item.question}\nResposta: ${item.answer}`;
          const doc = new Document({
            pageContent: pageContent,
            metadata: {
              source: fileName,
              type: 'faq',
              question: item.question,
              answer: item.answer,
              index: i
            }
          });
          documents.push(doc);
        } else {
          console.log(`Item inválido no índice ${i}`);
        }
      }
    } else if (fileName === 'vereadorInfo.json') {
      for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        if (item.nome) {
          let pageContent = `Vereador: ${item.nome}\n`;
          if (item.partido) pageContent += `Partido: ${item.partido}\n`;
          if (item['Nome completo']) pageContent += `Nome Completo: ${item['Nome completo']}\n`;
          if (item['Data de nascimento']) pageContent += `Data de Nascimento: ${item['Data de nascimento']}\n`;
          if (item.naturalidade) pageContent += `Naturalidade: ${item.naturalidade}\n`;
          if (item.biografia && item.biografia.trim() !== "") {
             pageContent += `\nBiografia:\n${item.biografia.trim()}\n`;
          }
          
          const keys = Object.keys(item);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!['nome', 'partido', 'Nome completo', 'Data de nascimento', 'Naturalidade', 'biografia'].includes(key) &&
                typeof item[key] === 'string' && item[key].trim() !== '') {
               pageContent += `\n${key}:\n${item[key].trim()}\n`;
            }
          }
    
          documents.push(new Document({
            pageContent: pageContent.trim(), 
            metadata: {
              source: fileName,
              type: 'vereador',
              nome: item.nome,
              partido: item.partido || 'Não informado', 
              index: i
            }
          }));
        } else {
          console.warn(`Item inválido no vereadorInfo.json (índice ${index}):`, item);
        }
      }
    }

    console.log(`Arquivo ${fileName} processado. ${documents.length} documentos criados.`);
    return documents;

  } catch (error) {
    console.error(`Erro ao processar o arquivo JSON ${filePath}:`, error);
    return []; 
  }
}

module.exports = {
  loadDocumentsFromJson,
};