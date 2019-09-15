<template>
  <div ref="root">
    <layout-generator :prepared="preparedSchema" :model="model">
      <template v-slot:field>
        <div />
      </template>
    </layout-generator>
    <!-- <pre>{{ resolvedSchema }}</pre> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import LayoutBuilder from './LayoutBuilder'
import LayoutGenerator from './LayoutGenerator'
import { LogicalBranch } from './schema/types'
import { prepareBranch, resolveTree } from './resolution'
import { Prepared } from './resolution/types'
import { ResolutionOptions } from './resolution/resolution'

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
  watch: {
    model: {
      deep: true,
      handler () {
        this.$forceUpdate()
      }
    }
  },
  components: { LayoutGenerator },
  computed: {
    preparedSchema (): Prepared.Any {
      return prepareBranch(this.schema)
    }
    // resolvedSchema (): ResolutionOptions | ResolutionOptions[] {
    //   console.log('resolution triggered', this.model)
    //   // return this.model
    //   return resolveTree(this.preparedSchema, { ...this.model })
    //   // return this.model
    // }
  }
})
</script>

<style>

</style>
