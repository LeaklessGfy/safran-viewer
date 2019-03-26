import { FieldType } from 'influx';

export default [
  {
    measurement: 'experiment',
    fields: {
      reference: FieldType.STRING,
      name: FieldType.STRING,
    },
    tags: ['id']
  }
];
