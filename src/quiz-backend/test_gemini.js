// Tenta importar a classe GoogleGenerativeAI de forma explícita
const GoogleGenerativeAIModule = require("@google/generative-ai");
const GoogleGenerativeAI = GoogleGenerativeAIModule.GoogleGenerativeAI;

// SUBSTITUA 'SUA_CHAVE_DE_API_GEMINI' PELA SUA CHAVE REAL DO GOOGLE AI STUDIO
const GEMINI_API_KEY = "AIzaSyChlVUOTt4Ub3dqIND7AvrPlcruCkTwOUc"; // <-- COLOQUE SUA CHAVE AQUI

async function runTest() {
    try {
        console.log("--- Verificando a classe GoogleGenerativeAI (importação alternativa) ---");
        console.log("Tipo de GoogleGenerativeAI importada:", typeof GoogleGenerativeAI);
        if (typeof GoogleGenerativeAI === 'function') {
            console.log("Propriedades do protótipo de GoogleGenerativeAI:", Object.getOwnPropertyNames(GoogleGenerativeAI.prototype));
        } else {
            console.log("GoogleGenerativeAI não é uma função/classe. Conteúdo:", GoogleGenerativeAI);
        }
        console.log("------------------------------------------------------------------");

        console.log("Tentando criar instância de GoogleGenerativeAI...");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        console.log("Instância genAI criada. Tipo:", typeof genAI);
        console.log("Objeto genAI (chaves diretas):", Object.keys(genAI));

        console.log("Verificando genAI.listModels...");
        console.log("Tipo de genAI.listModels:", typeof genAI.listModels);
        console.log("Valor de genAI.listModels:", genAI.listModels);

        if (typeof genAI.listModels !== 'function') {
            console.error("ERRO: genAI.listModels NÃO É UMA FUNÇÃO. Isso é inesperado.");
            console.error("Por favor, verifique se o pacote '@google/generative-ai' foi instalado corretamente e se não há conflitos.");
            
            // Tenta chamar getGenerativeModel para ver se ele funciona (já sabemos que funciona, mas para confirmar)
            try {
                console.log("Tentando chamar genAI.getGenerativeModel...");
                const modelTest = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
                console.log("genAI.getGenerativeModel retornou um objeto. Tipo:", typeof modelTest);
            } catch (e) {
                console.error("Erro ao testar getGenerativeModel:", e.message);
            }
            return; // Sai da função se listModels não for uma função
        }

        console.log("Chamando genAI.listModels()...");
        const { models } = await genAI.listModels();

        console.log("Modelos Gemini disponíveis:");
        const availableModels = models.map(model => ({
            name: model.name,
            displayName: model.displayName,
            supportedGenerationMethods: model.supportedGenerationMethods,
            inputTokenLimit: model.inputTokenLimit,
            outputTokenLimit: model.outputTokenLimit
        }));
        console.log(JSON.stringify(availableModels, null, 2));

    } catch (error) {
        console.error('Erro geral no teste:', error);
        console.error('Detalhes do erro:', error.message);
        if (error.status) {
            console.error('Status HTTP:', error.status);
            console.error('Status Text:', error.statusText);
        }
    }
}

runTest();
