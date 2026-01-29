import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.service.count();

    if (count === 0) {
      await this.prisma.service.createMany({
        data: [
          { name: 'Corte Tradicional', price: 45 },
          { name: 'Barba', price: 35 },
          { name: 'Corte + Barba', price: 70 },
          { name: 'Pezinho', price: 15 },
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