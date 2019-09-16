<template>
  <div ref="root">
    <layout-builder :tree="resolvedSchema">
      <template v-slot:field="field">
        <!-- <pre style="text-align: left">{{ field }}</pre> -->
        <component :is="lookup(field.widget.type)" v-bind="field.widget.params" />
      </template>
    </layout-builder>
    <pre style="text-align: left">{{ resolvedSchema }}</pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import LayoutBuilder from './layout/LayoutBuilder'
import { LogicalBranch } from './schema/types'
import { prepareBranch, resolveTree } from './resolution'
import { Prepared } from './resolution/types'
import { ResolutionOptions } from './resolution/resolution'
import { registry } from './widgets'
import './widgets/basicWidgets/heading'
import './widgets/basicWidgets/paragraph'

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
    resolvedSchema (): ResolutionOptions | ResolutionOptions[] {
      // return resolveTree(this.preparedSchema, this.model)
      // ^
      // Doesn't work, because the `this.model` is wrapped into a proxy under the hood
      // which breaks both Vue and memoize-state reactivity
      return resolveTree(this.preparedSchema, JSON.parse(JSON.stringify(this.model)))
      // ^
      // Works, because this causes resolution to trigger on each deep model change
      // and drops Vue's getter/setter wrappings, so Proxy-based memoization works properly
    }
  },
  mounted () {
    console.log(registry.list())
  }
})
</script>

<style>

</style>
