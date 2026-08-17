module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended", // React를 사용하는 경우
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"], // 필요한 플러그인만 남김
  rules: {
    "no-unused-vars": "off", // 사용되지 않은 변수 무시
    "no-undef": "off", // 정의되지 않은 변수 경고 무시
    "no-useless-catch": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
  },
};
