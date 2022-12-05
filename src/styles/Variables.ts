import { css } from 'styled-components';

const Variables = css`
  :root {
    // Font
    --font-main: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
      sans-serif;

    // Font size
    --fz-xxs: 10px;
    --fz-xs: 12px;
    --fz-sm: 14px;
    --fz-md: 16px;
    --fz-lg: 18px;
    --fz-xl: 20px;
    --fz-xxl: 22px;

    --topbar-font-size: 24px;

    // Colors
    --white: #fff;
    --black: #000;
    --grey: #242424;
    --lightgrey: #999999;
    --blue: #057dcd;
    --red: #a33;
    --green: #5ccc3b;
    --orange: #f0a907;
    --link: #888;

    // Other
    --max-width: 1500px;
    --transition: all 0.25s ease-in-out;
  }
`;

export default Variables;
