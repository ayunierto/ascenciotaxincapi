import { Account } from 'src/accounting/accounts/entities/account.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', {
    unique: true,
  })
  name: string;

  @Column('text', {
    unique: true,
  })
  coinSuffix: string;

  @Column('text')
  symbol: string;

  @OneToMany(() => Account, (account) => account.currency)
  accounts: Account[];

  @Column('timestamp with time zone', {
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  updateAt: Date;
}
