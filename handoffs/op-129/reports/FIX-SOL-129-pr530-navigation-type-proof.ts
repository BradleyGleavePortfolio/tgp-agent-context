// Isolated proof of the route-brand intersection / typed Partial mock.
// Imports only the installed React Navigation types, not the TGP app graph.
import type { NativeStackNavigationProp } from '/home/user/workspace/deps/mobile/node_modules/@react-navigation/native-stack';

type Routes = {
  LeanQ1: undefined;
  LeanQ2: undefined;
  LeanQ3: undefined;
  LeanQ4: undefined;
  LeanQ5: undefined;
  LeanQ6: undefined;
};
type NavigationFor<R extends keyof Routes> = NativeStackNavigationProp<Routes, R>;
type TestNavigation =
  NavigationFor<'LeanQ1'> &
  NavigationFor<'LeanQ2'> &
  NavigationFor<'LeanQ3'> &
  NavigationFor<'LeanQ4'> &
  NavigationFor<'LeanQ5'> &
  NavigationFor<'LeanQ6'>;
const navigationStub: Partial<TestNavigation> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};
const navigation = navigationStub as TestNavigation;
const q1: NavigationFor<'LeanQ1'> = navigation;
const q2: NavigationFor<'LeanQ2'> = navigation;
const q3: NavigationFor<'LeanQ3'> = navigation;
const q4: NavigationFor<'LeanQ4'> = navigation;
const q5: NavigationFor<'LeanQ5'> = navigation;
const q6: NavigationFor<'LeanQ6'> = navigation;
void [q1, q2, q3, q4, q5, q6];
