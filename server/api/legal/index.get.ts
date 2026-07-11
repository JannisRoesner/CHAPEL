import { getLegalContent } from '../../utils/legal'

export default defineEventHandler(async () => {
  return getLegalContent()
})
