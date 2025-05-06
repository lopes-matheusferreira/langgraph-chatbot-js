require("dotenv").config();
const { createAndSaveEmbeddings } = require("./db_config.js");

async function main() {
  console.log("Iniciando geração de embeddings...");
  try {
    const result = await createAndSaveEmbeddings();
    return result;
  } catch (error) {
    return "Erro ao criar e salvar embeddings";
  }
}

main().then(result => {
  console.log(result);
});
