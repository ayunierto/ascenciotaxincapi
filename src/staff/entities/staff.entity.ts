import { Service } from 'src/services/entities';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  name: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ManyToMany(() => Service, (service) => service.staffMembers)
  services: Service[];
}
