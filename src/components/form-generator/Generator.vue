<template>
  <div ref="root">
    <layout-builder :tree="resolvedSchema">
      <template v-slot:field="field">
        <!-- <pre style="text-align: left">{{ field }}</pre> -->
        <component :is="lookup(field.widget.type)" v-bind="field.widget.params" />
      </template>
    </layout-builder>
    <pre style="text-align: left">{{ resolvedSchema }}</pre>
    <pre style="text-align: left">{{ errorObject }}</pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import LayoutBuilder from './layout/LayoutBuilder'
import { LogicalBranch } from './schema/types'
import { prepareBranch, resolveTree } from './resolution'
import { Prepared } from './resolution/types'
import { ResolutionResult } from './resolution/resolution'
import { registry } from './widgets'
import './widgets/basicWidgets/heading'
import './widgets/basicWidgets/paragraph'
import { ValidatorLevel } from './validation/types'
import { collectValidators, CollectedValidators } from './validation'

type ValidationResults = {
  [k: string]: {
    [l in ValidatorLevel]: string[]
  }
}

export default Vue.extend({
  props: {
    schema: {
      type: Object as () => LogicalBranch,
      required: true
    },
    model: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      touched: {} as { [k: string]: boolean }
    }
  },
  components: { LayoutBuilder },
  methods: {
    lookup (key: string) {
      return registry.lookup(key).component
    }
  },
  computed: {
    preparedSchema (): Prepared.Any {
      return prepareBranch(this.schema)
    },
    cleanedModel (): any {
      return JSON.parse(JSON.stringify(this.model))
    },
    resolvedSchema (): ResolutionResult {
      // return resolveTree(this.preparedSchema, this.model)
      // ^
      // Doesn't work, because the `this.model` is wrapped into a proxy under the hood
      // which breaks both Vue and memoize-state reactivity
      return resolveTree(this.preparedSchema, this.cleanedModel)
      // ^
      // Works, because this causes resolution to trigger on each deep model change
      // and drops Vue's getter/setter wrappings, so Proxy-based memoization works properly
    },
    collectedValidators (): CollectedValidators {
      return collectValidators(this.resolvedSchema)
    },
    errorObject (): ValidationResults {
      return Object.keys(this.collectedValidators).reduce((agg, key) => {
        agg[key] = this.collectedValidators[key](this.touched[key] || false)
        return agg
      }, {} as ValidationResults)
    }
  },
  mounted () {
    console.log(registry.list())
  }
})
</script>

<style>

</style>
