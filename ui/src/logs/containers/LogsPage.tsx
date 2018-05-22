import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {getSourceAsync, setTimeRange, setNamespace} from 'src/logs/actions'
import {getSourcesAsync} from 'src/shared/actions/sources'
import {Source, Namespace, TimeRange} from 'src/types'
import LogViewerHeader from 'src/logs/components/LogViewerHeader'

interface Props {
  sources: Source[]
  currentSource: Source | null
  currentNamespaces: Namespace[]
  getSource: (sourceID: string) => void
  getSources: () => void
  setTimeRange: (timeRange: TimeRange) => void
  setNamespace: (namespace: Namespace) => void
  timeRange: TimeRange
}

class LogsPage extends PureComponent<Props> {
  public componentDidUpdate() {
    if (!this.props.currentSource) {
      this.props.getSource(this.props.sources[0].id)
    }
  }

  public componentDidMount() {
    this.props.getSources()
  }

  public render() {
    return (
      <div className="page hosts-list-page">
        <div className="page-header full-width">
          <div className="page-header__container">
            <div className="page-header__left">
              <h1 className="page-header__title">Log Viewer</h1>
            </div>
            <div className="page-header__right">{this.header}</div>
          </div>
        </div>
      </div>
    )
  }

  private get header(): JSX.Element {
    const {sources, currentSource, currentNamespaces, timeRange} = this.props

    return (
      <LogViewerHeader
        availableSources={sources}
        timeRange={timeRange}
        onChooseSource={this.handleChooseSource}
        onChooseNamespace={this.handleChooseNamespace}
        onChooseTimerange={this.handleChooseTimerange}
        currentSource={currentSource}
        currentNamespaces={currentNamespaces}
      />
    )
  }

  private handleChooseTimerange = (timeRange: TimeRange) => {
    this.props.setTimeRange(timeRange)
  }

  private handleChooseSource = (sourceID: string) => {
    this.props.getSource(sourceID)
  }

  private handleChooseNamespace = (namespace: Namespace) => {
    // Do flip
    this.props.setNamespace(namespace)
  }
}

const mapStateToProps = ({
  sources,
  logs: {currentSource, currentNamespaces, timeRange, currentNamespace},
}) => ({
  sources,
  currentSource,
  currentNamespaces,
  timeRange,
  currentNamespace,
})

const mapDispatchToProps = dispatch => ({
  getSource: bindActionCreators(getSourceAsync, dispatch),
  getSources: bindActionCreators(getSourcesAsync, dispatch),
  setTimeRange: bindActionCreators(setTimeRange, dispatch),
  setNamespace: bindActionCreators(setNamespace, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(LogsPage)
