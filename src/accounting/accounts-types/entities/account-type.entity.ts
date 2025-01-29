import { Account } from 'src/accounting/accounts/entities/account.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('accounts_type')
export class AccountType {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => Account, (account) => account.accountType)
  accounts: Account[];

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  updateAt: Date;
}
