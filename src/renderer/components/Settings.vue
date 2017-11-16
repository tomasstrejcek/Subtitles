<script>
  import Analytics from '@/services/analytics'
  import Settings from '@/services/settings'

  export default {
    name: 'Settings',

    data () {
      return {
        subLanguage: {},
        subExtension: {},
        subHearingImpaired: {},
        showSavedIcon: false,
        timeout: undefined
      }
    },

    mounted () {
      const settings = Settings.get()
      this.subLanguage = settings.subLanguage
      this.subExtension = settings.subExtension
      this.subHearingImpaired = settings.subHearingImpaired
    },

    beforeDestroy () {
      clearTimeout(this.timeout)
    },

    methods: {
      saveSettings () {
        Settings.set({
          subLanguage: this.subLanguage,
          subExtension: this.subExtension,
          subHearingImpaired: this.subHearingImpaired
        })
        this.showSavedIcon = true
        this.timeout = setTimeout(() => {
          this.showSavedIcon = false
        }, 1000)
      }
    }
  }
</script>

<template lang="pug">
  #settings.padded-more
    form
      .form-group
        label Subtitle Language
        select.form-control(v-model='subLanguage')
          option(v-bind:value='{value: \'eng\'}') English
          option(v-bind:value='{value: \'fre\'}') French
          option(v-bind:value='{value: \'spa\'}') Spanish
          option(v-bind:value='{value: \'ger\'}') German
          option(v-bind:value='{value: \'ita\'}') Italian
          option(v-bind:value='{value: \'por\'}') Portuguese
          option(v-bind:value='{value: \'cze\'}') Czech
      .form-group
        label Subtitle Extension
        select.form-control(v-model='subExtension')
          option(v-bind:value='{value: \'srt\'}') .srt
          option(v-bind:value='{value: \'vtt\'}') .vtt
      .form-group
        label Prefer Hearing Impaired
        input(type="checkbox", value="true").form-control(v-model='subHearingImpaired')
      .form-actions
        button.btn.btn-form.pull-right(@click.prevent='saveSettings')
          span.icon.icon-check(v-if='showSavedIcon')
          span(v-else) Save
</template>

<style lang="scss">
  #settings {
    display: flex;
    justify-content: center;
    align-items: center;
    form {
      width: 80%;
      input[type=checkbox] {
        width: 8%;
        min-width: 15px;
        margin: 5px;
      }
    }
  }
</style>
