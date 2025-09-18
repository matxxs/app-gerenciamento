import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { authSlice } from "../features/auth/auth-slice";
import { usersApiSlice } from "../features/users/user-api-slice";
import { telasApiSlice } from "../features/screens/screen-api-slice";
import { funcoesApiSlice } from "../features/funcoes/funcoes-api-slice";


const rootReducer = combineSlices(authSlice); 
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authSlice.name]: authSlice.reducer,
      [usersApiSlice.reducerPath]: usersApiSlice.reducer, 
      [telasApiSlice.reducerPath]: telasApiSlice.reducer,
      [funcoesApiSlice.reducerPath]: funcoesApiSlice.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        usersApiSlice.middleware,
        telasApiSlice.middleware,
        funcoesApiSlice.middleware
      ),
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