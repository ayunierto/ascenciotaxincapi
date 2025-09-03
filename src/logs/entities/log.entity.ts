import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.logs, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
