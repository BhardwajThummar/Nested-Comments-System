const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const comments = [
    {
        "Id": "c1bf6fd1-8e7b-454f-abfd-ebcf79cbf31d",
        "user": "user1-nested1",
        "content": "content1-nested1",
        "timestamp": 1694694480023,
        "parentCommentId": "1936a2f0-07e5-44a7-b6bb-849482ed5064",
        "childComments": [
            "dbe3ba46-4d92-4301-aa01-dc67b8be9572"
        ]
    },
    {
        "Id": "dbe3ba46-4d92-4301-aa01-dc67b8be9572",
        "user": "user1-nested1",
        "content": "content1-nested1",
        "timestamp": 1694694629771,
        "parentCommentId": "c1bf6fd1-8e7b-454f-abfd-ebcf79cbf31d",
        "childComments": []
    }
]

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method, req.path, Date.now())
    next()
})

app.post('/comments', (req, res) => {
    try {
        const body = req.body;
        let comment = {
            Id: uuidv4(),
            user: body.user,
            content: body.content,
            timestamp: Date.now(),
            parentCommentId: body.parentCommentId,
            childComments: []
        }
        comments.push(comment);
        return res.status(200).json("Succeed")
    }
    catch (e) {
        return res.status(500).json({
            message: "error"
        })
    }
})

app.post("/comments/:commentId", (req, res) => {
    try {
        const parenttCommentId = req.params.commentId;
        const body = req.body;
        let comment = {
            Id: uuidv4(),
            user: body.user,
            content: body.content,
            timestamp: Date.now(),
            parentCommentId: parenttCommentId,
            childComments: []
        }
        if (parenttCommentId) {
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].Id === parenttCommentId) {
                    comments[i].childComments.push(comment.Id);
                }
            }
        }
        comments.push(comment);
        return res.status(200).send("Succeed")
    }
    catch (e) {
        console.log(e)
        return res.status(500).send({
            message: "error"
        })
    }
})

let findCommentById = (commentId) => {
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].Id == commentId) {
            return comments[i];
        }
    }
    return null;
}

// populate all the comments recursively
let populate = (comment) => {
    let cc = Object.assign({}, comment);
    if (cc.childComments.length > 0) {
        let childComments = [];
        for (let i = 0; i < cc.childComments.length; i++) {
            let childComment = findCommentById(cc.childComments[i]);
            if (childComment) childComments.push(populate(childComment));
        }
        cc.childComments = childComments;
    }
    return cc;
}

app.get('/comments/:commentId', (req, res) => {
    try {
        let commentId = req.params.commentId;
        let comment = findCommentById(commentId);
        if (!comment) {
            return res.status(404).send({
                message: "Not found"
            })
        }
        return res.status(200).send(populate(comment));
    }
    catch (e) {
        console.log(e)
        return res.status(500).send({
            message: "error"
        })
    }
})

app.get('/comments', (req, res) => {
    return res.status(200).send(comments)
})

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
})
