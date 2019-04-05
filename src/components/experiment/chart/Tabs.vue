<template>
  <b-tabs content-class="mt-3">

    <!-- MODIFICATIONS -->
    <b-tab title="Modifications" active>
      <!-- ADD -->
      <b-form @submit="onSubmitModification" inline class="justify-content-center">
        <b-form-select
          v-model="modification.measure"
          class="mr-2"
          :options="measuresId"
          required
        />

        <cleave
          v-model="modification.startTime"
          :options="options"
          class="form-control mr-2"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          required
        />

        <b-form-select
          v-model="modification.operation"
          class="mr-2"
          :options="['ADD', 'CONSTANT']"
          required
        />

        <b-input v-model="modification.value" class="mr-2" type="number" />

        <cleave
          v-model="modification.endTime"
          :options="options"
          class="form-control mr-2"
          placeholder="hh:mm:ss,ssss"
          :raw="false"
          required
        />

        <b-button type="submit" variant="primary">Ajouter</b-button>
      </b-form>

      <!-- LIST -->
      <b-table striped hover :items="modifications" class="mt-2">
        <template slot="actions" slot-scope="scope">
          <b-button v-if="!scope.item.isApply" size="sm" variant="primary" @click="() => onToggleModification(scope.item, true)">
            Appliquer
          </b-button>
          <b-button v-else size="sm" variant="warning" @click="() => onToggleModification(scope.item, false)">
            Enlever
          </b-button>
          <b-button size="sm" variant="danger" class="ml-2" @click="() => onRemoveModification(scope.item)">
            Supprimer
          </b-button>
        </template>
      </b-table>
    </b-tab>

    <!-- LECTURE -->
    <b-tab title="Lecture">
      <b-table striped hover :items="timelineValues" />
    </b-tab>
  </b-tabs>
</template>

<script>
import uuid from 'uuid/v4';
import { dateToTime, timeToTimestamp } from '../../../services/date';

export default {
  props: {
    chart: Object,
    experiment: Object,
    measuresId: Array,
    timelineValues: Array
  },
  data() {
    return {
      options: {
        blocks: [2, 2, 2, 4],
        delimiters: [':', ':', '.'],
        numericOnly: true,
        numeralPositiveOnly: true,
        stripLeadingZeroes: false
      },
      modification: {
        measure: null,
        startTime: null,
        endTime: null,
        operation: 'ADD',
        value: 0,
        isApply: false,
        actions: null
      },
      modifications: []
    };
  },
  mounted() {
    this.chart.addOnSelectListener((startDate, endDate) => {
      this.modification.startTime = dateToTime(startDate);
      this.modification.endTime = dateToTime(endDate);
    });
  },
  methods: {
    onSubmitModification(e) {
      e.preventDefault();
      this.modifications.push({
        id: uuid(),
        ...this.modification
      });
    },
    onToggleModification(modification, state) {
      modification.isApply = state;
      const id = modification.id;
      const measure = { id: modification.measure };
      const startDate = timeToTimestamp(modification.startTime, this.experiment.beginTime);
      const endDate = timeToTimestamp(modification.endTime, this.experiment.endTime);
      const operation = modification.operation;
      const value = parseInt(modification.value, 10);

      if (state) {
        this.chart.addRange(id, measure, startDate, endDate, operation, value);
      } else {
        this.chart.removeRange(id);
      }
    },
    onRemoveModification(modification) {
      this.chart.removeRange(modification.id);
      this.modifications = this.modifications.filter(m => m !== modification);
    }
  }
}
</script>
