import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  timeZone: string;

  @Column()
  locale: string;

  @Column({ default: false, type: 'bool' })
  executedSeed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
