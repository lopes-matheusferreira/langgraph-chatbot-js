// require("dotenv").config();
// const fs = require("fs");
// const path = require("node:path");
// const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
// const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
// const { OpenAIEmbeddings } = require("@langchain/openai");
// const { FaissStore } = require("@langchain/community/vectorstores/faiss");

// const DATABASE_DIRECTORY = path.join(process.cwd(), "database");
// const FAISS_INDEX_PATH = path.join(DATABASE_DIRECTORY, "faiss_index");
// const DOCS_PATH = path.join(DATABASE_DIRECTORY, "docs.json");

// async function createAndSaveEmbeddings() {
//   /*------------------------------------------------+
//   |================ LOADING PDF's =================|
//   +------------------------------------------------*/
//   const pdfPath = process.env.PDF_PATH;
//   const files = fs.readdirSync(pdfPath).map(file => path.join(pdfPath, file));

//   let documents = [];
//   for (let i = 0; i < files.length; i++) {
//     const file = files[i];
//     const loader = new PDFLoader(file);
//     const docs = await loader.load();

//     for (let j = 0; j < docs.length; j++) {
//       documents.push(docs[j]);
//     }
//   }

//   /*------------------------------------------------+
//   |=============== SPLITTING TEXT =================|
//   +------------------------------------------------*/
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1500,
//     chunkOverlap: 1000,
//     separators: ["\n\n", "\n", " ", ""],
//   });

//   const splitDocs = await splitter.splitDocuments(documents);

//   if (!fs.existsSync(DATABASE_DIRECTORY)) {
//     fs.mkdirSync(DATABASE_DIRECTORY, { recursive: true });
//   }

//   /*------------------------------------------------+
//   |===== GENERATING EMBEDDINGS / VECTOR STORE =====|
//   +------------------------------------------------*/
//   try {
//     const embeddings = new OpenAIEmbeddings({
//       model: "text-embedding-3-large",
//     });

//     const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings, {
//       indexType: "IndexFlatIP",
//     });
//     await vectorStore.save(FAISS_INDEX_PATH);

//     fs.writeFileSync(DOCS_PATH, JSON.stringify(splitDocs, null, 2));
//     return { success: true, count: splitDocs.length };
//   } catch (error) {
//     console.error("Erro ao criar embeddings:", error);
//     return "Erro ao criar embeddings";
//   }
// }

// async function loadRetrieverFromStore() {
//   if (!fs.existsSync(FAISS_INDEX_PATH) || !fs.existsSync(DOCS_PATH)) {
//     return "Banco de dados FAISS não encontrado";
//   }

//   try {
//     /*------------------------------------------------+
//     |======= GENERATING EMBEDDINGS FROM QUERY =======|
//     +------------------------------------------------*/
//     const embeddings = new OpenAIEmbeddings({
//       model: "text-embedding-3-large",
//     });

//     /*------------------------------------------------+
//     |======= SET RETRIEVER FROM VECTOR STORE =======|
//     +------------------------------------------------*/
//     const vectorStore = await FaissStore.load(FAISS_INDEX_PATH, embeddings);
//     const retriever = vectorStore.asRetriever({
//       k: 8,
//       filter: null,
//       scoreThreshold: 0.8,
//     });
//     return retriever;
//   } catch (error) {
//     console.error("Erro ao carregar o banco de dados FAISS:", error);
//     return "Erro ao carregar o banco de dados FAISS";
//   }
// }

// module.exports = {
//   createAndSaveEmbeddings,
//   loadRetrieverFromStore,
// };


// else if (fileName === 'vereadorInfo.json') {
//       jsonData.forEach((item, index) => {
//         if (item.nome) {
//           let pageContent = `Vereador: ${item.nome}\n`;
//           if (item.partido) pageContent += `Partido: ${item.partido}\n`;
//           if (item['Nome completo']) pageContent += `Nome Completo: ${item['Nome completo']}\n`;
//           if (item['Data de nascimento']) pageContent += `Data de Nascimento: ${item['Data de nascimento']}\n`;
//           if (item.naturalidade) pageContent += `Naturalidade: ${item.naturalidade}\n`;
//           if (item.biografia && item.biografia.trim() !== "") {
//              pageContent += `\nBiografia:\n${item.biografia.trim()}\n`;
//           }
//           // Adicionar outros campos textuais relevantes se existirem, como 'Apresentação', etc.
//           // Exemplo: Iterar sobre chaves que não são 'nome' ou 'partido' e que contêm texto
//           Object.keys(item).forEach(key => {
//              if (!['nome', 'partido', 'Nome completo', 'Data de nascimento', 'Naturalidade', 'biografia'].includes(key) &&
//                  typeof item[key] === 'string' && item[key].trim() !== '') {
//                 pageContent += `\n${key}:\n${item[key].trim()}\n`;
//              }
//           });

//           documents.push(new Document({
//             pageContent: pageContent.trim(), // Remover espaços extras no final
//             metadata: {
//               source: fileName,
//               type: 'vereador',
//               nome: item.nome,
//               partido: item.partido || 'Não informado', // Incluir metadados chave
//               index: index
//             }
//           }));
//         } else {
//           console.warn(`Item inválido no vereadorInfo.json (índice ${index}):`, item);
//         }
//       });
//     }




//     require("dotenv").config();
// const fs = require("fs");
// const path = require("node:path");
// const { loadDocumentsFromJson } = require("./json_normalizer");
// const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
// const {
//   HuggingFaceInferenceEmbeddings,
// } = require("@langchain/community/embeddings/hf");
// const { FaissStore } = require("@langchain/community/vectorstores/faiss");
// const DATABASE_DIRECTORY = path.join(process.cwd(), "database");
// const FAISS_INDEX_PATH = path.join(DATABASE_DIRECTORY, "faiss_index");
// const DOCS_PATH = path.join(DATABASE_DIRECTORY, "docs.json"); 

// async function createAndSaveEmbeddings() {
//   /*------------------------------------------------+
//   |=============== LOADING JSON's =================| 
//   +------------------------------------------------*/
//   const jsonDirectoryPath = process.env.JSON_PATH;
//   if (!jsonDirectoryPath) {
//     return "Erro: JSON_PATH não definido";
//   }
//   if (!fs.existsSync(jsonDirectoryPath)) {
//      return `Erro: Diretório JSON não encontrado em ${jsonDirectoryPath}`;
//   }

//   console.log(`Carregando arquivos JSON de: ${jsonDirectoryPath}`);
//   const files = fs.readdirSync(jsonDirectoryPath)
//                   .filter(file => file.toLowerCase().endsWith('.json'))
//                   .map(file => path.join(jsonDirectoryPath, file));

//   if (files.length === 0) {
//       console.warn(`Nenhum arquivo .json encontrado em ${jsonDirectoryPath}`);
//       return "Nenhum arquivo JSON encontrado para processar";
//   }

//   let allDocuments = [];
//   const promises = files.map(file => loadDocumentsFromJson(file));
//   const results = await Promise.all(promises);
//   results.forEach(docsFromFile => {
//       allDocuments = allDocuments.concat(docsFromFile);
//   });

//   if (allDocuments.length === 0) {
//       return "Nenhum documento extraído dos arquivos JSON.";
//   } 
//   console.log("Total de documentos carregados");
//   /*------------------------------------------------+
//   |=============== SPLITTING TEXT =================|
//   +------------------------------------------------*/
//   console.log("Dividindo documentos...");
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000, 
//     chunkOverlap: 300, 
//     separators: ["\n\n", "\n", ". ", "? ", "! ", " ", ""], 
//   });

//   const splitDocs = await splitter.splitDocuments(allDocuments);
//   console.log(`Documentos divididos em ${splitDocs.length} chunks.`);

//   if (splitDocs.length === 0) {
//       return "Nenhum chunk gerado.";
//   }

//   if (!fs.existsSync(DATABASE_DIRECTORY)) {
//     fs.mkdirSync(DATABASE_DIRECTORY, { recursive: true });
//   }

//   /*------------------------------------------------+
//   |===== GENERATING EMBEDDINGS / VECTOR STORE =====|
//   +------------------------------------------------*/
//   try {
//     const embeddings = new HuggingFaceInferenceEmbeddings({
//       model: "thenlper/gte-base", 
//       apiKey: process.env.HF_API_KEY,
//     });

//     if (splitDocs.length === 0) {
//         throw new Error("Nenhum chunk disponível para criar o vector store.");
//     }

//     const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings); 
//     await vectorStore.save(FAISS_INDEX_PATH);

//     fs.writeFileSync(DOCS_PATH, JSON.stringify(splitDocs.map(doc => ({ 
//         pageContent: doc.pageContent,
//         metadata: doc.metadata
//     })), null, 2));

//     return { success: true, count: splitDocs.length };
//   } catch (error) {
//     console.error("Erro detalhado ao criar embeddings/vector store:", error);
//     if (error.response && error.response.data) {
//         console.error("Detalhes do erro da API:", error.response.data);
//     }
//     return `Erro ao criar embeddings: ${error.message}`;
//   }
// }

// async function loadRetrieverFromStore() {
//   if (!fs.existsSync(FAISS_INDEX_PATH)) { 
//     console.error(`Índice FAISS não encontrado em: ${FAISS_INDEX_PATH}`);
//     return "Banco de dados FAISS não encontrado. Execute o script de criação de embeddings primeiro.";
//   }

//   try {
//     /*------------------------------------------------+
//     |======= GENERATING EMBEDDINGS FROM QUERY =======|
//     +------------------------------------------------*/
//     const embeddings = new HuggingFaceInferenceEmbeddings({
//       model: "thenlper/gte-base",
//       apiKey: process.env.HF_API_KEY,
//     });

//     /*------------------------------------------------+
//     |======= SET RETRIEVER FROM VECTOR STORE =======|
//     +------------------------------------------------*/
//     const vectorStore = await FaissStore.load(FAISS_INDEX_PATH, embeddings);
//     console.log("Vector Store carregado com sucesso.");

//     const retriever = vectorStore.asRetriever({
//       k: 8, 
//       // filter: null, 
//       // scoreThreshold: 0.8,
//     });
//     return retriever;
//   } catch (error) {
//     return "Erro ao carregar o banco de dados FAISS";
//   }
// }

// module.exports = {
//   createAndSaveEmbeddings,
//   loadRetrieverFromStore,
// };