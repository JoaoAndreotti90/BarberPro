async function testarChat() {
  console.log("💬 Enviando mensagem para o John...");

  const resposta = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: "Quais serviços vocês têm e quanto custa?" 
    })
  });

  const dados = await resposta.json();
  console.log("🤖 Resposta da IA:", JSON.stringify(dados, null, 2));
}

testarChat();