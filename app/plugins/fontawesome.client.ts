import type { Component } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faBook, faCalendar, faCheck, faChevronDown, faChevronUp, faChurch, faCloudArrowDown, faCloudUploadAlt, faCog, faDownload, faForwardStep, faGripVertical, faHandPointer, faImage, faList, faListOl, faLock, faMobileAlt, faMoon, faMusic, faPalette, faPause, faPen, faPlay, faPlus, faSearch, faServer, faSignInAlt, faSignOutAlt, faStar, faStop, faSun, faTimes, faTrash, faUpload, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons'
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
    faListOl,
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
    faSignInAlt,
    faSignOutAlt,
    faStar,
    faStop,
    faSun,
    faTimes,
    faTrash,
    faUpload,
    faUsers,
    faXmark
  )
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon as Component)
})
