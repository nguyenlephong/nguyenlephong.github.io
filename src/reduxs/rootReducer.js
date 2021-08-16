import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/user';
import themesReducer from './slices/themes';


const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: []
};

const rootReducer = combineReducers({
  user: userReducer,
  themes: themesReducer,
});

export { rootPersistConfig, rootReducer };
