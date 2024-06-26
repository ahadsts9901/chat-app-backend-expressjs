import jwt from 'jsonwebtoken';
import "dotenv/config"
import { extendedSessionInDays, initialSessionInDays } from './schema.mjs';

export const issueLoginToken = (req, res, next) => {

    const { firstName, lastName, email, _id, profilePhoto, createdOn } = req.user;

    const hartRef = jwt.sign(
        {
            createdOn, firstName, lastName, email, _id, profilePhoto
        },
        process.env.SECRET,
        {
            expiresIn: `${extendedSessionInDays}d`
        }
    );

    res.cookie('hartRef', hartRef, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + extendedSessionInDays * 24 * 60 * 60 * 1000)
    });

    const hart = jwt.sign(
        {
            createdOn, firstName, lastName, email, _id, profilePhoto
        },
        process.env.SECRET,
        {
            expiresIn: `${initialSessionInDays}d`
        }
    );

    res.cookie('hart', hart, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + initialSessionInDays * 24 * 60 * 60 * 1000)
    });

    next()

}