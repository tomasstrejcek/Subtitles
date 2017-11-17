<script>
  import Helpers from '@/services/helpers'

  export default {
    name: 'Info',

    methods: {
      toggleDevTools () {
        Helpers.toggleDevTools()
      }
    },

    mounted () {
    }
  }
</script>

<template lang="pug">
  #info.padded-more
    h5(@click='toggleDevTools()') What's this?
    p This is a fork of open source app
      a.js-external-link(href='https://github.com/matiastucci/easysubs') &nbsp;Easysubs&nbsp;
      | .
      | This version is allows you to download subtitles from
      a.js-external-link(href='http://www.addic7ed.com') &nbsp;Addic7ed&nbsp;
      | in a very fast way.
    h5 Why?
    p Why not.
    h5 About me
    p Hi, my name is
      a.js-external-link(href='http://tomas-strejcek.cz/') &nbsp;Tomas&nbsp;
      | and I just don't like OpenSubtitles; Addic7ed ftw!
    .info-footer
      a.js-external-link(href='https://github.com/tomasstrejcek/Subtitles')
        span.icon.icon-github
      a.js-external-link(href='https://twitter.com/')
        span.icon.icon-twitter
    .info-footer-small
      a.js-external-link(href='https://github.com/matiastucci/easysubs') &nbsp;original app&nbsp;
      a.js-external-link(href='https://twitter.com/TucciMatias') &nbsp;author twitter&nbsp;
</template>

<style lang="scss">
  #info {
    h5 {
      margin-bottom: 5px;
    }
    p {
      margin-top: 5px;
    }
    .info-footer {
      text-align: center;
      .icon-github, .icon-twitter {
        font-size: 20px;
        margin: 10px;
        cursor: pointer;
      }
    }
    .info-footer-small {
      text-align: center;
      border-top: 1px solid gray;
      font-size: 12px;
    }
  }
</style>
