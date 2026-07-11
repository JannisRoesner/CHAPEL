import type { Component } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faBook, faCalendar, faCheck, faChevronDown, faChevronUp, faChurch, faCloudArrowDown, faCloudUploadAlt, faCog, faDownload, faForwardStep, faGripVertical, faHandPointer, faImage, faList, faLock, faMobileAlt, faMoon, faMusic, faPalette, faPause, faPen, faPlay, faPlus, faSearch, faServer, faSignOutAlt, faStop, faSun, faTimes, faTrash, faUpload, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineNuxtPlugin((nuxtApp) => {
  library.add(
    faBars,
    faBook,
    faCalendar,
    faCheck,
    faChevronDown,
    faChevronUp,
    faChurch,
    faCloudArrowDown,
    faCloudUploadAlt,
    faCog,
    faDownload,
    faForwardStep,
    faGripVertical,
    faHandPointer,
    faImage,
    faList,
    faLock,
    faMobileAlt,
    faMoon,
    faMusic,
    faPalette,
    faPause,
    faPen,
    faPlay,
    faPlus,
    faSearch,
    faServer,
    faSignOutAlt,
    faStop,
    faSun,
    faTimes,
    faTrash,
    faUpload,
    faUsers
  )
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon as Component)
})
