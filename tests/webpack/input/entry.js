import Colors from "./imports/colors";
import * as Constants from "./imports/constants";
import { LINE_HEIGHT } from "./imports/constants";

function double(n) {
  return n * 2;
}

const FONT_FAMILY = "Lato";

const styles = StyleSheet.create({
  foo: {
    fontFamily: FONT_FAMILY,
    fontSize: Constants.FONT_SIZE,
    color: Colors.GREEN,
    lineHeight: double(LINE_HEIGHT)
  },
  bar: {
    width: __DEV__ ? 100 : 200
  }
});
