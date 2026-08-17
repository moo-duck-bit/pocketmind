import { getLocalStorage, removeLocalStorage, setLocalStorage } from "./helper";

const GateUserDefaultKey = {
  _EMAIL: "email",
  _IS_SAVE: "isSaveEmail",
  _USER_ID: "userId",
  _USER_GOAL: "userGoal",
};

export const setEmail = (email) => {
  setLocalStorage(GateUserDefaultKey._EMAIL, email);
};

export const getEmail = () => {
  const email = getLocalStorage(GateUserDefaultKey._EMAIL);
  return email;
};

export const deleteEmail = () => {
  removeLocalStorage(GateUserDefaultKey._EMAIL);
};

export const setIsSaveEmail = (isSave) => {
  setLocalStorage(GateUserDefaultKey._IS_SAVE, isSave);
};

export const getIsSaveEmail = () => {
  const isSave = getLocalStorage(GateUserDefaultKey._IS_SAVE);
  return isSave;
};

export const deleteIsSaveEmail = () => {
  removeLocalStorage(GateUserDefaultKey._IS_SAVE);
};

export const setUserId = (userId) => {
  setLocalStorage(GateUserDefaultKey._USER_ID, userId);
};

export const getUserId = () => {
  const userId = getLocalStorage(GateUserDefaultKey._USER_ID);
  return userId;
};

export const deleteUserId = () => {
  removeLocalStorage(GateUserDefaultKey._USER_ID);
};

export const setGoal = (goal) => {
  setLocalStorage(GateUserDefaultKey._USER_GOAL, goal);
};

export const getGoal = () => {
  const goal = getLocalStorage(GateUserDefaultKey._USER_GOAL);
  return goal;
};

export const deletGoal = () => {
  removeLocalStorage(GateUserDefaultKey._USER_GOAL);
};
