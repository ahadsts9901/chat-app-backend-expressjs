import fs from "fs"
import "dotenv/config"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) {
            console.log("no file");
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })

        fs.unlink(localFilePath, (unlinkError) => {
            if (unlinkError) {
                console.error("Error removing local file:", unlinkError);
            }
        });

        return response;

    } catch (error) {

        console.log(error);

        fs.unlinkSync(localFilePath)
        return null;
    }
}