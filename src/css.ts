// tslint:disable-next-line:no-var-requires
const jss: any = require("jss").default;
// tslint:disable-next-line:no-var-requires
const preset: any = require("jss-preset-default").default;

jss.setup(preset());

export default function css<T>(styles: T): { [P in keyof T]: string } {
    return jss.createStyleSheet(styles).attach().classes;
}
 