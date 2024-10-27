import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceImage } from './service-image.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @ManyToOne(() => User, (user) => user.service, { eager: true })
  user: User;

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

  @OneToMany(() => ServiceImage, (image) => image.service, { cascade: true })
  images?: ServiceImage;
}