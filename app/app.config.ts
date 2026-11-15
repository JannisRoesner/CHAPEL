export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      // Liturgie: aus dem Farbschema abgeleitete, gedämpfte Begleitfarbe (siehe main.css)
      secondary: 'liturgy',
      neutral: 'slate'
    },
    button: {
      defaultVariants: {
        size: 'md'
      }
    },
    input: {
      defaultVariants: {
        size: 'lg'
      }
    },
    select: {
      defaultVariants: {
        size: 'lg'
      }
    },
    textarea: {
      defaultVariants: {
        size: 'lg'
      }
    }
  }
})
