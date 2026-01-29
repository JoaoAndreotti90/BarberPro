import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.service.count();

    if (count === 0) {
      let professional = await this.prisma.professional.findFirst();

      if (!professional) {
        professional = await this.prisma.professional.create({
          data: { 
            name: 'Barbeiro Principal',
            phone: '11999999999' 
          }
        });
      }

      await this.prisma.service.createMany({
        data: [
          { name: 'Corte Tradicional', price: 45, durationMinutes: 45, professionalId: professional.id },
          { name: 'Barba', price: 35, durationMinutes: 30, professionalId: professional.id },
          { name: 'Corte + Barba', price: 70, durationMinutes: 60, professionalId: professional.id },
          { name: 'Pezinho', price: 15, durationMinutes: 15, professionalId: professional.id },
        ],
      });
    }
  }

  async create(dto: CreateScheduleDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const customer = await this.prisma.customer.upsert({
      where: { phone: dto.customerPhone },
      update: { name: dto.customerName },
      create: {
        name: dto.customerName,
        phone: dto.customerPhone,
      },
    });

    return this.prisma.appointment.create({
      data: {
        dateTime: dto.dateTime,
        customerId: customer.id,
        serviceId: service.id,
        professionalId: service.professionalId,
      },
    });
  }

  findAll() {
    return this.prisma.appointment.findMany({
      include: {
        customer: true,
        service: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
    });
  }

  findAllServices() {
    return this.prisma.service.findMany();
  }
}