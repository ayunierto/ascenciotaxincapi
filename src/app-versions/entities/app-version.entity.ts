import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AppPlatform {
  IOS = 'ios',
  ANDROID = 'android',
  ALL = 'all',
}

@Entity()
export class AppVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AppPlatform, default: AppPlatform.ALL })
  platform: AppPlatform;

  @Column()
  minSupportedVersion: string;

  @Column()
  latestVersion: string;

  @Column({ default: false })
  forceUpdate: boolean;

  @Column({ nullable: true })
  releaseNotes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
