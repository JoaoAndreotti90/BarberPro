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
      model: 'gemini-flash-latest', 
      tools: [
        {
          functionDeclarations: [
            {
              name: 'buscar_servicos',
              description: 'Retorna a lista de serviços disponíveis e seus preços.',
            },
            {
              name: 'agendar_horario',
              description: 'Agenda um serviço. Requer nome do cliente, telefone, nome exato do serviço e data/hora.',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  nomeCliente: { type: SchemaType.STRING },
                  telefoneCliente: { type: SchemaType.STRING },
                  nomeServico: { type: SchemaType.STRING },
                  dataHora: { type: SchemaType.STRING, description: 'Data e hora no formato ISO 8601' },
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
      Você é o recepcionista virtual da barbearia BarberPro.
      Data de hoje: ${new Date().toLocaleString('pt-BR')}.
      
      Regras de Atendimento:
      1. Se o cliente disser "Oi", "Olá" ou iniciar a conversa, execute IMEDIATAMENTE a função "buscar_servicos". Não pergunte nada antes de mostrar os serviços.
      2. Após mostrar os serviços, espere o cliente escolher um.
      3. Quando o cliente escolher o serviço, pergunte: Dia, Horário, Nome e Telefone.
      4. Somente quando tiver TODAS as 4 informações (Serviço, Dia, Horário, Nome, Telefone), execute a função "agendar_horario".
      5. Seja formal e direto.
      
      Mensagem do Cliente: ${message}
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
          
          if (services.length === 0) {
             respostaTexto = "Olá! No momento não encontrei serviços cadastrados. Pode tentar novamente?";
          } else {
             respostaTexto = `Olá! Aqui estão nossos serviços:\n\n${services.map((s: any) => `- ${s.name}: R$${s.price}`).join('\n')}\n\nQual serviço você gostaria de agendar?`;
          }
        }

        else if (call.name === 'agendar_horario') {
          const args = call.args as any;
          
          if (!args.nomeCliente || !args.telefoneCliente || !args.dataHora || !args.nomeServico) {
            respostaTexto = "Preciso de todos os dados para agendar: Nome do Serviço, Dia, Horário, seu Nome e Telefone.";
          } else {
            const allServices = await this.scheduleService.findAllServices();
            const service = allServices.find((s: any) => 
              s.name.toLowerCase().includes(args.nomeServico.toLowerCase())
            );

            if (!service) {
              respostaTexto = `Não encontrei o serviço "${args.nomeServico}". Por favor, escolha um serviço da lista.`;
            } else {
              const dataFormatada = new Date(args.dataHora);

              if (isNaN(dataFormatada.getTime())) {
                respostaTexto = "Data inválida. Por favor, informe o dia e horário novamente (ex: Amanhã às 14h).";
              } else {
                const existingAppointments = await this.scheduleService.findAll();
                
                const isBusy = existingAppointments.some((appointment: any) => {
                    const appointmentDate = new Date(appointment.dateTime);
                    const timeDiff = Math.abs(appointmentDate.getTime() - dataFormatada.getTime());
                    return timeDiff < 60 * 60 * 1000; 
                });

                if (isBusy) {
                    respostaTexto = "Esse horário já está ocupado. Por favor, escolha outro horário.";
                } else {
                    await this.scheduleService.create({
                        customerName: args.nomeCliente,
                        customerPhone: args.telefoneCliente,
                        serviceId: service.id,
                        dateTime: dataFormatada.toISOString(), 
                      });
                      
                    respostaTexto = `Agendamento Confirmado!\n\nServiço: ${service.name}\nCliente: ${args.nomeCliente}\nData: ${dataFormatada.toLocaleString('pt-BR')}\n\nTe esperamos lá!`;
                    this.conversationHistory = []; 
                }
              }
            }
          }
        } else {
            respostaTexto = "Desculpe, tive um erro interno ao processar sua solicitação.";
        }
      } else {
        respostaTexto = response.text();
      }

      if (!respostaTexto) {
          respostaTexto = "Olá! Como posso ajudar você hoje?";
      }

      this.conversationHistory.push(
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: respostaTexto }] }
      );

      return respostaTexto;

    } catch (error: any) {
      if (error.message && error.message.includes('429')) {
         return "Muitos pedidos no momento. Tente novamente em alguns segundos.";
      }
      return "Ocorreu um erro técnico no agendamento. Tente novamente.";
    }
  }
}