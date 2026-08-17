// 로컬 스토리지에 값 저장
export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// 로컬 스토리지에서 값 가져오기
export const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

// 로컬 스토리지에서 값 삭제
export const removeLocalStorage = (key) => {
  localStorage.removeItem(key);
};
