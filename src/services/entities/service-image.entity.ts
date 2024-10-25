import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ServiceImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;
}
