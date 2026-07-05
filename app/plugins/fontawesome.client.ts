import type { Component } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChurch, faForwardStep, faMusic, faPause, faPlay, faStop, faSun, faMoon, faCloudArrowDown, faTrash, faPen, faPlus, faGripVertical, faSignOutAlt, faBook, faList, faCalendar, faCog, faUpload, faSearch, faCheck, faTimes, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineNuxtPlugin((nuxtApp) => {
  library.add(
    faChurch,
    faForwardStep,
    faMusic,
    faPause,
    faPlay,
    faStop,
    faSun,
    faMoon,
    faCloudArrowDown,
    faTrash,
    faPen,
    faPlus,
    faGripVertical,
    faSignOutAlt,
    faBook,
    faList,
    faCalendar,
    faCog,
    faUpload,
    faSearch,
    faCheck,
    faTimes,
    faBars
  )
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon as Component)
})
