import express from 'express';
import { stringToHash, varifyHash } from "bcrypt-inzi";
import { emailPattern, passwordPattern, firstNamePattern, lastNamePattern, userModel } from '../../schema.mjs';
import { issueLoginToken } from '../../middlewares.mjs';
import "dotenv/config"

let router = express.Router()

router.post('/signup', async (req, res, next) => {

    try {

        if (!req?.body?.firstName || !req?.body?.lastName || !req?.body?.email || !req?.body?.password) {
            res.status(400).send({
                message: `required parameters missing`
            });
            return;
        }

        if (!firstNamePattern.test(req?.body?.firstName)) {
            res.status(400).send({
                message: "invalid first name pattern"
            })
            return;
        }

        if (!lastNamePattern.test(req?.body?.lastName)) {
            res.status(400).send({
                message: "invalid last name pattern"
            })
            return;
        }

        if (!emailPattern.test(req?.body?.email)) {
            res.status(400).send({
                message: "invalid email"
            })
            return;
        }

        if (!passwordPattern.test(req?.body?.password)) {
            res.status(400).send({
                message: "password must be between 6 to 20 characters and contain at least one alphabet and one number"
            })
            return;
        }

        const user = await userModel.findOne({ email: req?.body?.email }).exec();

        if (user) {
            res.status(409).send({
                message: "user already exists",
            });
            return;
        }

        const passwordHash = await stringToHash(req?.body?.password);

        const userAccountResponse = await userModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
            profilePhoto: "https://tse3.mm.bing.net/th?id=OIP.hJwdwU9WmUfKfgvMpOkXmAHaHa&pid=Api&P=0&h=220",
        });

        req.user = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            createdOn: userAccountResponse?.createdOn,
            _id: userAccountResponse?._id,
            profilePhoto: "https://tse3.mm.bing.net/th?id=OIP.hJwdwU9WmUfKfgvMpOkXmAHaHa&pid=Api&P=0&h=220",
        }

        next()

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'server error, please try later',
            error: error,
        });
    }
}, issueLoginToken,
    (req, res, next) => {
        res.send({
            message: "signup successfull",
        })
    }
);

router.post('/login', async (req, res, next) => {

    if (!req?.body?.email || !req?.body?.password) {

        res.status(400).send({
            message: `required parameters missing`
        });
        return;

    }

    req.body.email = req?.body?.email?.toLowerCase();

    if (!emailPattern.test(req?.body?.email)) {
        res.status(400).send({
            message: "invalid email"
        })
        return;
    }

    if (!passwordPattern.test(req?.body?.password)) {
        res.status(400).send({
            message: "password must be between 6 to 20 characters and contain at least one alphabet and one number"
        })
        return;
    }

    try {
        const result = await userModel.findOne({ email: req?.body?.email }).exec();

        if (!result) {
            res.status(400).send({
                message: "email or password incorrect",
            });
            return;
        }

        const isMatch = await varifyHash(req?.body?.password, result?.password)

        if (!isMatch) {
            res.status(401).send({
                message: "email or password incorrect",
            })
            return;
        }

        // for next middleware

        req.user = {
            createdOn: result?.createdOn,
            firstName: result?.firstName,
            lastName: result?.lastName,
            email: result?.email,
            _id: result?._id,
            profilePhoto: result?.profilePhoto,
        };

        next();

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'server error, please try later',
            error: error,
        });
    }
},
    issueLoginToken,
    (req, res, next) => {
        res.send({
            message: "login successful",
        })
    }
)

export default router