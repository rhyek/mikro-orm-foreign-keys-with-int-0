import { MikroORM } from '@mikro-orm/core';
import { MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql'
import { PersonEntity } from '../src/entities/person.entity';
import { TaskEntity } from '../src/entities/task.entity';

describe('tests', () => {
  let orm: MikroORM<MySqlDriver>;
  let em: SqlEntityManager;

  beforeAll(async () => {
    orm = await MikroORM.init<MySqlDriver>({
      type: 'mysql',
      entities: [PersonEntity, TaskEntity],
      clientUrl: 'mysql://root:root@localhost:6000/test'
    });

    await orm.em.nativeDelete(TaskEntity, {});
    await orm.em.nativeDelete(PersonEntity, {});

    await orm.em.nativeInsert(TaskEntity, {
      description: 'person zero task',
      person: await orm.em.nativeInsert(PersonEntity, {
        id: 0,
        name: 'zero',
      }),
    });
    await orm.em.nativeInsert(TaskEntity, {
      description: 'person one task',
      person: await orm.em.nativeInsert(PersonEntity, {
        id: 1,
        name: 'one',
      }),
    });
    await orm.em.nativeInsert(TaskEntity, {
      description: 'person two task',
      person: await orm.em.nativeInsert(PersonEntity, {
        id: 2,
        name: 'two',
      }),
    });
  });

  afterAll(async () => {
    await orm.close();
  });

  beforeEach(() => {
    em = orm.em.fork({ clear: true });
  });

  it('persons exist', async () => {
    const persons = await em.find(PersonEntity, {});
    expect(persons.length).toEqual(3);
  });

  it('tasks exist', async () => {
    const tasks = await em.find(TaskEntity, {});
    expect(tasks.length).toEqual(3);
  });

  it('first task\'s person_id is null, rest are ok', async () => {
    const tasks = await em.find(TaskEntity, {}, { orderBy: { id: 'asc'}});
    expect(tasks[0].person).toEqual(null);
    expect(tasks[1].person.id).toEqual(1);
    expect(tasks[2].person.id).toEqual(2);
  });

  it('can update first task\'s id to 0 manually', async () => {
    await em.createQueryBuilder(TaskEntity).update({ person: 0 }).where({ person: null }).execute();
    const tasks = await em.find(TaskEntity, {}, { orderBy: { id: 'asc'}, limit: 1});
    expect(tasks[0].person.id).toEqual(0);
  })

  it('tasks with populated persons, persons have name', async () => {
    const tasks = await em.find(TaskEntity, {}, { populate: ['person'], orderBy: { id: 'asc'}});

    expect(tasks[1].person.id).toEqual(1);
    expect(tasks[1].person.name).toEqual('one');
    expect(tasks[2].person.id).toEqual(2);
    expect(tasks[2].person.name).toEqual('two');
    expect(tasks[0].person.id).toEqual(0);
    expect(tasks[0].person.name).toEqual('zero');
  });
});
