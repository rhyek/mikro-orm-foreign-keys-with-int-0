import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { PersonEntity } from './person.entity';

@Entity({
  tableName: 'task',
})
export class TaskEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  description!: string;

  @ManyToOne(() => PersonEntity)
  person!: PersonEntity;
}
