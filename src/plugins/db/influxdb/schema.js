import { FieldType } from 'influx';

export default [
  {
    measurement: 'experiments',
    fields: {
      reference: FieldType.STRING,
      name: FieldType.STRING,
      bench: FieldType.STRING,
      campaign: FieldType.STRING,
      isLocal: FieldType.BOOLEAN,
      beginTime: FieldType.INTEGER,
      endTime: FieldType.INTEGER
    },
    tags: ['id']
  },
  {
    measurement: 'measures',
    fields: {
      name: FieldType.STRING,
      type: FieldType.STRING,
      unit: FieldType.STRING
    },
    tags: ['id', 'experimentId']
  },
  {
    measurement: 'samples',
    fields: {
      value: FieldType.STRING
    },
    tags: ['experimentId', 'measureId']
  },
  {
    measurement: 'alarms',
    fields: {
      level: FieldType.INTEGER,
      message: FieldType.STRING
    },
    tags: ['experimentId']
  }
];
