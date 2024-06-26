import express from 'express';
import { chatModel } from '../../schema.mjs';
import "dotenv/config"
import { upload } from '../../multer.mjs';
import { uploadOnCloudinary } from "../../functions.mjs"
import { isValidObjectId } from 'mongoose';
import { globalIoObject } from "../../core.mjs"

let router = express.Router()

router.post('/message', upload.any(), async (req, res, next) => {

    if (!req?.body?.to_id || (!req?.body?.message && !req?.files && !req?.files[0])) {

        res.status(400).send({
            message: `required parameters missing`
        });
        return;
    }

    if (!isValidObjectId(req?.body?.to_id)) {
        res.status(400).send({
            message: "invalid user id"
        });
        return;
    }

    try {

        var fileUrl = null
        var fileType = null

        if (req?.files[0]) {

            fileUrl = uploadOnCloudinary(req?.files[0])
            fileType = req?.files[0]?.mimetype

        }

        const newMessage = {
            from_id: req?.currentUser?._id,
            to_id: req?.body?.to_id,
            message: req?.body?.message,
            fileUrl: fileUrl,
            fileType: fileType
        }

        const insertResponse = await chatModel.create(newMessage)

        // send message to socket server
        newMessage._id = insertResponse?._id;

        if (globalIoObject?.io) {
            console.log(`emitting message to ${req?.body?.to_id}`);
            globalIoObject.io.emit(req?.body?.to_id, newMessage);
        }

        res.send({ message: 'message sent' });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'internal server error',
            error: error,
        });
    }
});

router.get('/messages/:from_id', async (req, res, next) => {

    if (!req?.params?.from_id) {
        res.status(400).send({
            message: `required parameters missing`
        });
        return
    }

    if (!isValidObjectId(req?.params?.from_id)) {
        res.status(400).send({
            message: `invalid user id`
        });
        return;
    }

    try {

        const chats = chatModel.find({
            $or: [
                {
                    to_id: req?.currentUser?._id,
                    from_id: req?.params?.from_id,
                }
                ,
                {
                    from_id: req?.currentUser?._id,
                    to_id: req?.params?.from_id,
                }
            ]
        }).sort({ _id: 1 })

        res.send({
            message: "chat fetched",
            data: chats
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `internal server error`,
            error: error,
        });
    }

});

router.put('/message/:messageId', async (req, res, next) => {

    const messageId = req?.params?.messageId;
    const { message } = req.body;

    if (!message) {
        res.status(400).send({
            message: `reqiured parameter missing`
        });
        return;
    }

    try {

        const updateResponse = await chatModel.findByIdAndUpdate(
            { _id: messageId },
            { $set: { message } }
        );

        res.send({
            message: "message updated successfully"
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: `internal server error`,
            error: error,
        });
    }
});

router.delete('/message/:messageId', async (req, res, next) => {

    const messageId = req?.params?.messageId

    if (!messageId) {
        res.status(400).send({
            message: "messageId not provided"
        })
        return
    }

    if (!isValidObjectId(messageId)) {
        res.status(400).send({
            message: "invalid id"
        })
        return
    }

    try {

        const deleteResponse = await chatModel.findByIdAndDelete(messageId);

        res.send({
            message: "chat cleared"
        })

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: `internal server error`,
            error: error,
        });
    }

});

// router.delete('/messages/:from_id/:to_id', async (req, res, next) => {

//     const from_id = req?.params?.from_id
//     const to_id = req?.params?.to_id

//     try {

//         const deleteResponse = await chatModel.deleteMany({
//             $or: [
//                 { from_id: from_id, to_id: to_id },
//                 { from_id: to_id, to_id: from_id }
//             ]
//         });

//         res.send({
//             message: "chat cleared"
//         })

//     } catch (error) {
//         console.error(error);
//         res.status(500).send({
//             message: `internal server error`,
//             error: error,
//         });
//     }

// });

export default router