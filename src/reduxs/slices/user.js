import { createSlice } from '@reduxjs/toolkit';
import axios from "../../services/axios"
// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  user: null,
  currentPartner: null,
  userPartners: [],
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET PROFILE
    getUserByIdSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
    },

    // GET userPartners
    getUserPartnersSuccess(state, action) {
      state.isLoading = false;
      state.userPartners = action.payload;
    },

    // SET currentPartner
    setCurrentPartnerSuccess(state, action) {
      state.currentPartner = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setCurrentPartnerSuccess, getUserByIdSuccess, startLoading, hasError } = slice.actions;

// ----------------------------------------------------------------------

export function getUser() {
  return async dispatch => {
    dispatch(slice.actions.startLoading());
    try {
      const responseMe = await axios.get(`/users/me`);
      const response = await axios.get(`/users/${responseMe.data.id}`);
      dispatch(slice.actions.getUserByIdSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getUserPartner() {
  return async dispatch => {
    dispatch(slice.actions.startLoading());
    try {
      const responseMe = await axios.get(`/users/me`);
      const response = await axios.get(`/partner-members?user.id=${responseMe.data.id}`);
      dispatch(slice.actions.getUserPartnersSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}