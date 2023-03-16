// @flow

import variable from './../variables/material';

export default (variables /* : * */ = variable) => {
  const h3Theme = {
    color: variables.textColor,
    fontSize: variables.fontSizeH3,
    lineHeight: variables.lineHeightH3,
    fontFamily: variables.titleFontfamily,
    marginVertical: 10
  };

  return h3Theme;
};
