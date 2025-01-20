import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @Column('text')
  title: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;

  @ManyToOne((type) => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;
}
