import React, {Component} from 'react';
import { Link } from 'react-router-dom';

export default class LinkBox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const styleSis = {
      marginBottom: '10px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      paddingLeft: '10px',
      paddingRight: '10px',
      maxWidth: '100%',
      backgroundColor: '#00A0E0'
    };
    const styleBrv = {
      marginBottom: '10px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      paddingLeft: '10px',
      paddingRight: '10px',
      maxWidth: '100%',
      backgroundColor: '#FFFFFF'
    };
    const styleGoogle = {maxWidth: '100%'};
    return (
      <React.Fragment>
        {this.props.showLogoPlay && <a href='https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' rel="noopener" target="_blank"><img style={styleGoogle} alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/></a>}
        {this.props.showLogoSis && <a href={"http://sissportssenter.no/"} rel="noopener" target="_blank"><img style={styleSis} src={"/png/sis-sportssenter.png"} alt="SiS Sportssenter"/></a>}
        {this.props.showLogoBrv && <a href={"http://brv.no/"} rel="noopener" target="_blank"><img style={styleBrv} src={"/png/brv.png"} alt="Bratte Rogalands venner"/></a>}
      </React.Fragment>
    );
  }
}
