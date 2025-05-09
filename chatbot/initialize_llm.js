const { loadRetrieverFromStore } = require('./config_model/db_utils.js');
const { list } = require('./config_files/data_feed.js');
const { AIMessage } = require('@langchain/core/messages');
const {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} = require('@langchain/langgraph');
const {
    llm,
    retrieval_llm,
    checkIfRetriever,
    systemInstructions,
    retrievalPromptTemplate,
    createTrimmer,
    determineRetrievalNeed,
    handleDirectResponse,
	handleRetrieverResponse,
	logDebugInfo
} = require('./config_model/llm_utils');

/*------------------------------------------------+
|=============== LOAD RETRIEVER ==================|
+------------------------------------------------*/
let retriever;
loadRetrieverFromStore()
    .then(r => { retriever = r; })
    .catch(err => { console.error('Failed to load retriever:', err); });

/*------------------------------------------------+
|================ MAIN FUNCTION ==================|
+------------------------------------------------*/
const callModel = async (state) => {
    const trimmer = createTrimmer();
    
    try {
        if (!state.messages?.length) {
            throw new Error('No messages available');
        }

        const trimmedMessages = trimmer(state.messages);
        const lastMessage = trimmedMessages[trimmedMessages.length - 1].content;
        
        const recentMessages = trimmedMessages
            .slice(-3)
            .filter(msg => 
                msg?.content &&
                !msg.content.toLowerCase().includes('olá') &&
                !msg.content.includes('Sou o agente de IA') &&
                !msg.content.includes('Os atuais vereadores da Câmara, separados por partido são')
            )
            .map(msg => msg.content)
			.join('\n');
        //========  USE RETRIEVER? ========//
        const { isRetrieverNeeded, retrieverQuery } = await determineRetrievalNeed(
            lastMessage,
            recentMessages,
            { checkIfRetriever, retrievalPromptTemplate, retrieval_llm }
        );

		if (!isRetrieverNeeded) {
			console.log("\n======== SKIPPING RETRIEVER ========");
			console.log("\n => GENERATING ANSWER AT:", new Date().toLocaleTimeString())
            return await handleDirectResponse(trimmedMessages, { llm, systemInstructions });
		} else {
		//======= DEFAULT ANSWER? ======//
			if (retrieverQuery === "lista completa de vereadores" || retrieverQuery === "lista completa de vereadores da Câmara"
				|| retrieverQuery === "lista completa de vereadores da camara"){
				console.log("\n======== PREDEFINED RESPONSE ========")
				console.log("\n => GENERATING ANSWER AT:", new Date().toLocaleTimeString())
				const formattedList = list;
				return {
					messages: [new AIMessage({ content: formattedList })],
				};
			} else {		
        //===========   USE RETRIEVER   ===========//
			return await handleRetrieverResponse(
				retrieverQuery,
				recentMessages,
				trimmedMessages,
				lastMessage,
				{ llm, systemInstructions, retriever, logDebugInfo }
			);
			}
		}
    } catch (error) {
        console.log('Error in callModel:', error);
        return {
            messages: [
                new AIMessage({
                    content: 'Estamos com dificuldades técnicas. Por favor, digite "atendente" para falar com um atendente.',
                }),
            ],
        };
    }
};

/*------------------------------------------------+
|================== SET GRAPH ====================|
+------------------------------------------------*/
const workflow = new StateGraph(MessagesAnnotation)
    .addNode('model', callModel)
    .addEdge(START, 'model')
    .addEdge('model', END);

const chatApp = workflow.compile({ checkpointer: new MemorySaver() });

module.exports = { chatApp };