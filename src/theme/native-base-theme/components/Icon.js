// @flow

import variable from './../variables/material';

export default (variables /* : * */ = variable) => {
  const iconTheme = {
    fontSize: variables.iconFontSize,
    color: variables.textColor
  };

  return iconTheme;
};
