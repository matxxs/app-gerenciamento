import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/authSlice";
import { usersApiSlice } from "./features/users/usersApiSlice"; 

const rootReducer = combineSlices(authSlice); 
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authSlice.name]: authSlice.reducer,
      [usersApiSlice.reducerPath]: usersApiSlice.reducer, 
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(usersApiSlice.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;