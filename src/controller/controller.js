const { processCreateConversation, processAddMessage, getConversation, getAllThreads, deleteConversation } = require("../service/service.js");

async function createConversation(req, res) {
  try {
    const threadId = req.body?.threadId;
    const initialMessages = req.body?.initialMessages || [];
    
    const resultId = await processCreateConversation(threadId, initialMessages);
    res.json({ threadId: resultId });
  } catch (error) {
    console.error("Erro ao criar conversa:", error);
    res.status(500).json({ error: "Falha ao criar conversa" });
  }
}

async function addMessage(req, res) {
  try {
    const { threadId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Mensagem não fornecida" });
    }
    
    const result = await processAddMessage(threadId, message);
    res.json(result);
  } catch (error) {
    console.error("Erro ao adicionar mensagem:", error);
    
    if (error.message === "Conversa não encontrada") {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Falha ao adicionar mensagem" });
  }
}

async function getChatHistory(req, res) {
  try {
    const { threadId } = req.params;
    const conversation = await getConversation(threadId); 
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversa não encontrada" });
    }
    
    res.json({ 
      threadId,
      messages: conversation.messages.map(msg => ({
        role: msg._getType ? msg._getType().toLowerCase() : (msg.type || "unknown"),
        content: msg.content
      }))
    });
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);
    res.status(500).json({ error: "Falha ao buscar conversa" });
  }
}

async function getKeys(req, res) {
  try {
    const threadIds = await getAllThreads(); 
    res.json({ threadIds });
  } catch (error) {
    console.error("Erro ao listar conversas:", error);
    res.status(500).json({ error: error.message || "Falha ao listar conversas" });
  }
}

async function deleteChat(req, res) {
  try {
    const { threadId } = req.params;
    const deleted = await deleteConversation(threadId);
    
    if (deleted) {
      res.json({ success: true, message: "Conversa excluída com sucesso" });
    } else {
      res.status(404).json({ error: "Conversa não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao excluir conversa:", error);
    res.status(500).json({ error: error.message || "Falha ao excluir conversa" });
  }
}

module.exports = { 
  createConversation,
  addMessage,
  getChatHistory,
  getKeys,
  deleteChat
}
