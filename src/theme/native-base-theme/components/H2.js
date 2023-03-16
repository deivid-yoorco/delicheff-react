// @flow

import variable from './../variables/material';

export default (variables /* : * */ = variable) => {
  const h2Theme = {
    color: variables.textColor,
    fontSize: variables.fontSizeH2,
    lineHeight: variables.lineHeightH2,
    fontFamily: variables.titleFontfamily,
    marginVertical: 10
  };

  return h2Theme;
};
