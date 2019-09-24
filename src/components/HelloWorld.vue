<template>
  <div class="hello">
    <div><label><input type="checkbox" v-model="model.value" />Value</label></div>
    <div><label><input type="checkbox" v-model="model.deeply.nested.value" />Deeply nested value</label></div>
    <generator :model="model" :schema="schema" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Generator from './form-generator/Generator.vue'
import { LogicalBranch } from './form-generator/schema/types'
import './form-generator/widgets/basicWidgets/paragraph'
import './form-generator/widgets/basicWidgets/input'

interface IData {
  model: any,
  schema: LogicalBranch
}

export default Vue.extend({
  name: 'HelloWorld',
  components: { Generator },
  data (): IData {
    return {
      model: {
        deeply: {
          nested: {
            value: true,
            text: 'whatever'
          }
        },
        inputType: 'text',
        value: true
      },
      schema: {
        type: 'if',
        predicate: {
          _modelPath: 'value'
        },
        then: {
          type: 'field',
          modelPath: 'deeply.nested.text',
          widget: {
            type: 'basicInput',
            params: {
              type: {
                _modelPath: 'inputType'
              }
            }
          },
          validation: [
            {
              type: 'required',
              message: 'Value should not be "false"',
              level: 'error',
              runOnEmpty: true
            },
            { type: 'isTrue', message: 'should be true', level: 'info' }
          ]
        }
      }
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
