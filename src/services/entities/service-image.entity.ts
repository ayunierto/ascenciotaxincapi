import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity()
export class ServiceImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne(() => Service, (service) => service.images, { eager: true })
  service: Service;
}
