import * as path from "path";
import * as fs from "fs";

export class FileSystem {

    public static getSubDirectories(srcpath) {
        return fs.readdirSync(srcpath)
            .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
            .map(file => path.join(srcpath, file));
    }

    public static readdirSyncRecoursive(root, files = [], prefix = '') {
        let self = this,
            dir = path.join(root, prefix);
        if (!fs.existsSync(dir)) return files;
        if (fs.statSync(dir).isDirectory()) {
            fs.readdirSync(dir)
                .forEach(function (name) {
                    files = self.readdirSyncRecoursive(root, files, path.join(prefix, name));
                });
        } else {
            files.push(prefix);
        }

        return files;
    }
}
