<template>
  <div class="hello">
    <div><label><input type="checkbox" v-model="model.deeply.nested.value" /> Test</label></div>
    <generator :model="model" :schema="schema" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Generator from './form-generator/Generator.vue'
import { LogicalBranch } from './form-generator/schema/types'

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
        value: true
      },
      schema: {
        type: 'if',
        predicate: {
          _modelPath: 'deeply.nested.value'
        },
        then: {
          type: 'field',
          modelPath: '',
          widget: {
            type: 'paragraph',
            params: {
              text: {
                _modelPath: 'deeply.nested.text'
              }
            }
          }
        },
        else: {
          type: 'level',
          level: 'else',
          children: []
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
