import { IsDateString, IsString, IsUUID, Length } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @Length(3, 100)
  customerName: string;

  @IsString()
  @Length(10, 15)
  customerPhone: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  dateTime: string;
}