import express from 'express';
import { stringToHash, varifyHash } from "bcrypt-inzi";
import fs from "fs"
import { passwordPattern, firstNamePattern, lastNamePattern, userModel } from '../../schema.mjs';
import "dotenv/config"
import { upload } from '../../multer.mjs';
import { uploadOnCloudinary } from "../../functions.mjs"
import { isValidObjectId } from 'mongoose';

let router = express.Router()

router.post('/logout', async (req, res, next) => {

    try {

        res.clearCookie('hart');
        res.clearCookie('hartRef');
        res.send({
            message: "logout successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "internal server error",
            error: error,
        })
    }

})

router.put('/name', async (req, res, next) => {

    if (!req?.body?.firstName || !req?.body?.lastName) {
        res.status(400).send({
            message: `required parameters missing`,
        })
        return;
    }

    if (!firstNamePattern.test(req?.body?.firstName)) {
        res.status(400).send({
            message: `invalid first name`,
        })
        return;
    }

    if (!lastNamePattern.test(req?.body?.lastName)) {
        res.status(400).send({
            message: `invalid first name`,
        })
        return;
    }

    const { currentUser } = req

    if (!isValidObjectId(currentUser?._id)) {
        res.status(400).send({
            message: `invalid user id`,
        });
        return;
    }

    try {

        const result = await userModel.findByIdAndUpdate(
            { _id: currentUser?._id },
            {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName
                }
            }
        )

        res.send({
            message: "name updated successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'server error, please try later',
            error: error,
        });
    }

},
)

router.put('/profile-picture', upload.any(), async (req, res, next) => {

    if (!req?.files || !req?.files[0]) {
        res.status(400).send({
            message: `required parameters missing`
        })
        return;
    }

    if (req?.files[0]?.size > 2000000) {
        res.status(400).send({
            message: 'file size limit exceed, maximum limit 2MB',
        });
        return;
    }

    const { currentUser } = req

    try {

        const uploadedImage = uploadOnCloudinary(req?.files[0]?.path)

        if (!isValidObjectId(currentUser?._id)) {
            res.status(400).send({
                message: `invalid user id`,
            });
            return;
        }

        const userUpdateResponse = await userModel?.findByIdAndUpdate(
            { _id: currentUser?._id },
            { $set: { profilePhoto: uploadedImage?.url } }
        );

        try {
            fs.unlinkSync(req?.files[0]?.path)
        } catch (err) {
            console.error(err)
            res.status(500).send({
                message: 'server error, please try later',
            });
        }

        res.send({
            message: "profile picture updated successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'server error, please try later',
            error: error,
        });
    }

}
)

router.put('/password', async (req, res, next) => {

    if (!req?.body?.newPassword || !req?.body?.oldPassword) {
        res.status(400).send({
            message: `required parameters missing`
        })
        return;
    }

    if (!passwordPattern.test(req?.body?.newPassword)) {
        res.status(400).send({
            message: "new password must be between 6 to 20 characters and contain at least one alphabet and one number"
        })
        return;
    }

    const { currentUser } = req

    if (!isValidObjectId(currentUser?._id)) {
        res.status(400).send({
            message: `invalid user id`,
        });
        return;
    }

    try {

        const user = await userModel.findById(currentUser?._id).exec();

        if (!user) {
            res.status(401).send({
                message: 'account not found',
            });
            return;
        }

        const userPasswordHash = user?.password
        const isMatch = await varifyHash(req?.body?.oldPassword, userPasswordHash)

        if (!isMatch) {
            res.status(401).send({
                message: 'invalid password',
            });
            return;
        }

        const newPasswordHash = await stringToHash(req.body.newPassword);

        const userEmailUpdateResponse = await userModel.findByIdAndUpdate(
            { _id: currentUser?._id },
            { $set: { password: newPasswordHash } }
        ).exec();

        res.send({
            message: "password updated successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'internal server error', error: error });
    }

})

router.get('/profile', async (req, res, next) => {

    const userId = req?.currentUser?._id;

    if (!userId) {
        res.status(400).send({
            message: `required parameters missing`
        })
        return;
    }

    if (!isValidObjectId(userId)) {
        res.status(400).send({
            message: `invalid user id`,
        });
        return;
    }

    const user = await userModel.findById(userId).exec();

    if (!user) {
        res.status(404).send({
            message: 'account not found',
        });
        return;
    }

    try {

        res.send({
            message: 'account founded',
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePhoto: user.profilePhoto,
                _id: user._id,
                createdOn: user.createdOn,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'internal server error',
            error: error,
        });
    }

})

router.get('/profile/:userId', async (req, res, next) => {

    const userId = req?.params?.userId;

    if (!userId) {
        res.status(400).send({
            message: `required parameters missing`
        })
        return;
    }

    if (!isValidObjectId(userId)) {
        res.status(400).send({
            message: `invalid user id`,
        });
        return;
    }

    const user = await userModel.findById(userId).exec();

    if (!user) {
        res.status(404).send({
            message: 'account not found',
        });
        return;
    }

    try {

        res.send({
            message: 'account founded',
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePhoto: user.profilePhoto,
                _id: user._id,
                createdOn: user.createdOn,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'internal server error',
            error: error,
        });
    }

})

export default router