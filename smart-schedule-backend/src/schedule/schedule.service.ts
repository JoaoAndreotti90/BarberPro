import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

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