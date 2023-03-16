// @flow

import variable from './../variables/material';

export default (variables /* : * */ = variable) => {
  const viewTheme = {
    '.padder': {
      padding: variables.contentPadding
    }
  };

  return viewTheme;
};
