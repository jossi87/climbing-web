import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import config from '../../../utils/config.js';

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
      <div>
        {config.isBouldering() && <a href="https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1" target="_blank"><img style={styleGoogle} alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/images/generic/en-play-badge.png" /></a>}
        {config.getRegion()==1 && <a href={"http://sissportssenter.no/"} target="_blank"><img style={styleSis} src={"/png/sis-sportssenter.png"} alt="SiS Sportssenter"/></a>}
        {(config.getRegion()==1 || config.getRegion()==4) && <a href={"http://brv.no/"} target="_blank"><img style={styleBrv} src={"/png/brv.png"} alt="Bratte Rogalands venner"/></a>}
      </div>
    );
  }
}
