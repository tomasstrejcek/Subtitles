<script>
  import Analytics from '@/services/analytics'
  import Videos from '@/services/videos'
  import Subtitles from '@/services/subtitles'

  export default {
    name: 'VideosList',

    data () {
      return {
        videos: Videos.get()
      }
    },

    beforeRouteEnter (to, from, next) {
      next(vm => {
        if (!Videos.get().length) {
          vm.$router.push('home')
        }
      })
    },

    mounted () {
      let downloads = []
      for (let i in this.videos) {
        const video = this.videos[i]
        const dld = this.downloadSub(video.id, video.name, video.path, video.size)
        downloads.push(dld)
      }
      if (this.videos.length) {
        Promise.all(downloads).then(() => {
          new Notification('Downloads completed', {
            body: 'Enjoy your subs :) \n Number of dowloads: ' + this.videos.length
            // TODO: fix icon path
          })
        })
      }
    },

    beforeDestroy () {
      Videos.clear()
    },

    methods: {
      downloadSub (id, name, path, size) {
        return Subtitles.get(id, name, path, size).then(() => {
          this.changeStatus(id, 'completed')
        })
      },
      changeStatus (id, status) {
        for (let i = 0; i < this.videos.length; i++) {
          if (this.videos[i].id === id) {
            this.videos[i].status = status
            return
          }
        }
      }
    }
  }
</script>

<template lang="pug">
  #files-list
    table.table-striped
      thead
        tr
          th.th-name Name
          th Status
      tbody
        tr(v-for='video in videos')
          td {{ video.name }}
          td.text-center
            .spinner(v-if='video.status === \'loading\'')
              .bounce1
              .bounce2
              .bounce3
            span.icon.icon-cancel(v-else-if='video.status === \'error\'')
            span.icon.icon-check(v-else-if='video.status === \'completed\'')
</template>

<style lang="scss">
  #files-list {
    width: 100%;
    table {
      table-layout: fixed;
      .th-name {
        width: 80%;
      }
      .text-center {
        text-align: center;
      }
    }
  }
</style>
