import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App); it also ensures
// the environment is set up appropriately whether the app is loaded in Expo Go or a dev build.
registerRootComponent(App);
