async function verOQueEuTenho() {
  const API_KEY = "AIzaSyAq2QEZBDZ_FCu1VK-g-HwJPCrd_aLcUuM"; 

  console.log("🔍 Consultando lista de modelos permitidos para sua chave...");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    const data = await response.json();

    if (data.error) {
      console.error("❌ ERRO NA CONTA:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("⚠️ Nenhum modelo encontrado. A API pode estar desativada.");
      return;
    }

    console.log("✅ MODELOS DISPONÍVEIS (Use um destes nomes):");
    console.log("------------------------------------------------");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`👉 ${m.name.replace("models/", "")}`);
      }
    });
    console.log("------------------------------------------------");

  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

verOQueEuTenho();