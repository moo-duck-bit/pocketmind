import { extendTheme } from  '@chakra-ui/theme-tools';


const breakpoints = {
  smCustom: "575px", // 커스텀 브레이크포인트
};

const theme = extendTheme({
  breakpoints,
});

export default theme;