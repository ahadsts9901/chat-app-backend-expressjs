import multer, { diskStorage } from "multer";
import "dotenv/config";

const storageConfig = diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        console.log("mul-file: ", file);
        cb(null, `postImg-${new Date().getTime()}-${file.originalname}`)
    }
})

export const upload = multer({ storage: storageConfig })