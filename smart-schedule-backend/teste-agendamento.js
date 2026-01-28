async function testarAgendamento() {
  const msg = {
    message: "Quero agendar um Corte Degradê para amanhã às 10h da manhã. Meu nome é Carlos e meu zap é 11999998888."
  };

  console.log("💬 Enviando pedido de agendamento...");
  
  const resposta = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  });

  const dados = await resposta.json();
  console.log("🤖 Resposta:", dados);
}

testarAgendamento();