import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { List, Segment, Header, Pagination, Loader } from 'semantic-ui-react';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Link, withRouter } from 'react-router-dom';

class Ticks extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data, loading: false};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.page);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.page !== this.props.match.params.page) {
      this.refresh(this.props.match.params.page);
    }
  }

  refresh(page) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), page).then((data) => this.setState(() => ({data, loading: false})));
  }

  onPageChange = (e, data) => {
    const page = data.activePage;
    this.setState({loading: true});
    this.props.history.push("/ticks/" + page);
  }

  render() {
    const { data, loading } = this.state;
    if (!data) {
      return <LoadingAndRestoreScroll />;
    }
    return (
      <>
        <MetaTags>
          <title>{data.metadata.title}</title>
          <meta name="description" content={data.metadata.description} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={data.metadata.description} />
          <meta property="og:url" content={data.metadata.og.url} />
          <meta property="og:title" content={data.metadata.title} />
          <meta property="og:image" content={data.metadata.og.image} />
          <meta property="og:image:width" content={data.metadata.og.imageWidth} />
          <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        </MetaTags>
        <Segment>
          <div>
            <Header as="h3">Public ascents</Header>
          </div>
          {loading?
            <><Loader active inline style={{marginTop: '20px', marginBottom: '20px'}} /><br/></>
          :
            <List>
              {data.ticks.map((t, i) => (
                <List.Item key={i} as={Link} to={`/problem/${t.problemId}`}>
                  <List.Description>
                    {t.date}
                    {' '}{t.areaName} <LockSymbol visibility={t.areaVisibility}/> / {t.sectorName} <LockSymbol visibility={t.sectorVisibility}/> / <a>{t.problemName} <LockSymbol visibility={t.problemVisibility}/></a>
                    {' '}| {t.name}
                    {' '} {t.problemGrade}
                    {t.fa && <b> FA</b>}
                  </List.Description>
                </List.Item>
              ))}
            </List>
          }
          <Pagination defaultActivePage={data.currPage} totalPages={data.numPages} onPageChange={this.onPageChange} />
        </Segment>
      </>
    );
  }
}

export default withRouter(Ticks);
