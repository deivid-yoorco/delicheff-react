// @flow

import variable from './../variables/material';

export default (variables /* : * */ = variable) => {
  const h1Theme = {
    color: variables.textColor,
    fontSize: variables.fontSizeH1,
    lineHeight: variables.lineHeightH1,
    fontFamily: variables.titleFontfamily,
    marginVertical: 10
  };

  return h1Theme;
};
