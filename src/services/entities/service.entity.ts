import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('bool', {
    default: false,
  })
  isAvailableOnline: boolean;

  @Column('text')
  duration: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;
}
