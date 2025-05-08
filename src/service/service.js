const { v4: uuidv4 } = require('uuid');
const { save, get, getAllKeys, remove } = require('../redis/redis.js');
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const serializeMessages = (messages) => {
  return messages.map(msg => ({
    type: msg._getType ? msg._getType() : (msg.type || "unknown"),
    content: msg.content,
    additional_kwargs: msg.additional_kwargs || {}
  }));
};

const deserializeMessages = (serializedMessages) => {
  return serializedMessages.map(msg => {
    if (msg.type === 'human') {
      return new HumanMessage(msg.content);
    } else if (msg.type === 'ai') {
      return new AIMessage(msg.content, msg.additional_kwargs);
    } else {
      return { type: msg.type, content: msg.content };
    }
  });
};

const { chatApp } = require('../../chatbot/initialize_llm.js');

async function processCreateConversation(threadId, initialMessages) {
  if (initialMessages && !Array.isArray(initialMessages)) {
    console.log('Os mensagens iniciais devem ser um array');
    return null;
  }
  
  const conversationId = threadId || uuidv4();
  const messages = initialMessages || [];
  
  const conversation = {
    messages: serializeMessages(messages), 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: messages.length
  };
  
  const key = `conversation:${conversationId}`;
  await save(key, conversation);
  
  return conversationId;
}

async function getConversation(threadId) {
  if (!threadId) {
    console.log('ID da conversa é obrigatório');
    return null;
  }  
  const key = `conversation:${threadId}`;
  const data = await get(key);
  
  if (!data) {
    return null;
  }

  return {
    ...data,
    messages: deserializeMessages(data.messages)
  };
}

async function processAddMessage(threadId, message) {
  const conversation = await getConversation(threadId);
  
  if (!conversation) {
    console.log('Conversa não encontrada');
    return null;
  }
  
  const currentMessages = conversation.messages;
  const input = [
    ...currentMessages,
    new HumanMessage(message)
  ];
  
  const config = { configurable: { thread_id: threadId } };
  const output = await chatApp.invoke({ messages: input }, config); 
  const responseMessage = output.messages[output.messages.length - 1];  
  const updatedMessages = [...input, responseMessage];
  
  const updatedConversation = {
    messages: serializeMessages(updatedMessages), 
    updatedAt: new Date().toISOString(),
    messageCount: updatedMessages.length
  };
  
  const key = `conversation:${threadId}`;
  await save(key, updatedConversation);
  
  return {
    threadId,
    responseMessage: {
      type: responseMessage._getType ? responseMessage._getType() : 'ai',
      content: responseMessage.content
    }
  };
}

async function getAllThreads() {
  try {
    const keys = await getAllKeys('conversation:*');
    return keys.map(key => key.replace('conversation:', ''));
  } catch (error) {
    console.log('Erro no service ao listar conversas:', error);
    return [];
  }
}

async function deleteConversation(threadId) {
  try {
    const key = `conversation:${threadId}`;
    const deleted = await remove(key); 
    return deleted;
  } catch (error) {
    console.log('Erro no service ao excluir conversa:', error);
    return false;
  }
}

module.exports = { 
  processCreateConversation,
  processAddMessage,
  getConversation,
  getAllThreads,
  deleteConversation
}