// Libraries
import React, {PureComponent} from 'react'

// Types
import {Variable} from '@influxdata/influx'

// Styles
import 'src/timeMachine/components/fluxFunctionsToolbar/FluxFunctionsToolbar.scss'

interface Props {
  variable: Variable
}

interface State {}

class ToolbarFunction extends PureComponent<Props, State> {
  public state: State = {isActive: false, hoverPosition: undefined}

  public render() {
    const {variable} = this.props
    return (
      <dl className="variables-toolbar--container">
        <div className="variables-toolbar--function">
          <dd>{variable.name}</dd>
        </div>
      </dl>
    )
  }
}

export default ToolbarFunction
