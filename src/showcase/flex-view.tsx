import React from 'react'

/**
 * A FlexView component will output a div with preset styles of flex display.
 */

 type ComponentProps = {
    children: any,
    /**
     * Override or extend the default styles.
     */
    style?: {},
    /**
     * Shortcut to set the flexDirection style property
     */
    row?: boolean | false,
}

export const FlexView = (props: ComponentProps) => {
  const styles = {
    default: {
      height: '100%',
      width: '100%',
      flexGrow: 1,
      display: 'flex',
      flexDirection: props.row ? 'row': 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }

  let outputStyles = {
    ...styles.default,
    ...props.style,
  }

  if (outputStyles.width === '100%') {
    outputStyles = {
      ...outputStyles,
      ...{
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        marginRight: 0,
      },
    }
  }
  if (outputStyles.height === '100%') {
    outputStyles = {
      ...outputStyles,
      ...{
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
      },
    }
  }
  let setProps = {...props}
  setProps.style = outputStyles
  delete setProps.row

  return (
    <div {...setProps}>
      {props.children}
    </div>
  )
}


export default FlexView