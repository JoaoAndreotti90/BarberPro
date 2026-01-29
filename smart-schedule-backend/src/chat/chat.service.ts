import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, SchemaType, Content } from '@google/generative-ai';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class ChatService {
  private model: GenerativeModel;
  private conversationHistory: Content[] = [];

  constructor(
    private configService: ConfigService,
    private scheduleService: ScheduleService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-001', 
      tools: [
        {
          functionDeclarations: [
            {
              name: 'buscar_servicos',
              description: 'Retorna a lista de serviços e preços.',
            },
            {
              name: 'agendar_horario',
              description: 'Agenda o serviço. Exige Nome, Telefone, NomeExatoDoServiço e Data.',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  nomeCliente: { type: SchemaType.STRING },
                  telefoneCliente: { type: SchemaType.STRING },
                  nomeServico: { type: SchemaType.STRING },
                  dataHora: { type: SchemaType.STRING, description: 'ISO 8601' },
                },
                required: ['nomeCliente', 'telefoneCliente', 'nomeServico', 'dataHora'],
              },
            },
          ],
        },
      ],
    });
  }

  async generateResponse(message: string) {
    const chat = this.model.startChat({
      history: this.conversationHistory
    });

    const promptInicial = `
      Você é o recepcionista da BarberPro. Hoje é: ${new Date().toLocaleString('pt-BR')}.
      
      Diretrizes:
      1. Se o cliente iniciar a conversa, chame buscar_servicos.
      2. Se o cliente escolher o serviço, pergunte Dia, Horário, Nome e Telefone.
      3. Se tiver todos os dados, chame agendar_horario.
      4. Seja formal e direto. Não use emojis.
      
      Cliente: ${message}
    `;

    try {
      const result = await chat.sendMessage(promptInicial);
      const response = await result.response;
      const functionCalls = response.functionCalls();

      let respostaTexto = "";

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        
        if (call.name === 'buscar_servicos') {
          const services = await this.scheduleService.findAllServices(); 
          respostaTexto = `Olá. Segue a lista de serviços:\n\n${services.map(s => `- ${s.name}: R$${s.price}`).join('\n')}\n\nQual serviço deseja agendar?`;
        }

        else if (call.name === 'agendar_horario') {
          const args = call.args as any;
          
          if (!args.nomeCliente || !args.telefoneCliente || !args.dataHora || !args.nomeServico) {
            respostaTexto = "Para confirmar, informe o Nome do Serviço, Dia, Horário, seu Nome e Telefone.";
          } else {
            const allServices = await this.scheduleService.findAllServices();
            const service = allServices.find(s => 
              s.name.toLowerCase().includes(args.nomeServico.toLowerCase())
            );

            if (!service) {
              respostaTexto = `Serviço ${args.nomeServico} não encontrado. Por favor, verifique o nome.`;
            } else {
              const dataFormatada = new Date(args.dataHora);

              if (isNaN(dataFormatada.getTime())) {
                respostaTexto = "Data inválida. Por favor, repita o dia e horário.";
              } else {
                
                const existingAppointments = await this.scheduleService.findAll();
                const isBusy = existingAppointments.some(appointment => {
                    const appointmentDate = new Date(appointment.dateTime);
                    return Math.abs(appointmentDate.getTime() - dataFormatada.getTime()) < 60000;
                });

                if (isBusy) {
                    respostaTexto = "Este horário já está reservado. Por favor, escolha outro horário.";
                } else {
                    await this.scheduleService.create({
                        customerName: args.nomeCliente,
                        customerPhone: args.telefoneCliente,
                        serviceId: service.id,
                        dateTime: dataFormatada.toISOString(), 
                      });
                      
                    respostaTexto = `Agendamento confirmado. Serviço: ${service.name}. Cliente: ${args.nomeCliente}. Data: ${dataFormatada.toLocaleString('pt-BR')}.`;
                    this.conversationHistory = []; 
                }
              }
            }
          }
        }
      } else {
        respostaTexto = response.text();
      }

      if (respostaTexto) {
          this.conversationHistory.push(
            { role: 'user', parts: [{ text: message }] },
            { role: 'model', parts: [{ text: respostaTexto }] }
          );
      }

      return respostaTexto;

    } catch (error: any) {
      console.error("ERRO DETALHADO:", error);
      if (error.message && error.message.includes('429')) {
         return "O sistema está ocupado. Tente novamente em breve.";
      }
      return "Ocorreu um erro técnico. Tente novamente.";
    }
  }
}