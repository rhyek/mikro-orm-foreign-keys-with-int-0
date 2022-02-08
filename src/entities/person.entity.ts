import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { TaskEntity } from './task.entity';

@Entity({
  tableName: 'person',
})
export class PersonEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @OneToMany(() => TaskEntity, (task) => task.person)
  tasks = new Collection<TaskEntity>(this);
}
