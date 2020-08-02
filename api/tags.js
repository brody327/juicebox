const express = require("express");
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");

    next();
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;

    console.log(req.user);

    try {
        const posts = await getPostsByTagName(tagName);

        //This doesn't work. Ran out of time. I have no idea how to get the current user. It doesn't exist in the req. 
        //I combed through the entire req object trying to find something to use but didn't get anyhting. 
        //Are you suppsoed to put in "requireUser" before the callback?
        //If so, I'm a bit salty.
        const filteredPosts = posts.filter(post => {
            console.log(post.author.id);
            return post.active && (req.user && post.author.id === req.user.id);
        });

        res.send({ posts: filteredPosts })
    } catch ({ name, message }) {
        next({ name, message });
    }
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

module.exports = tagsRouter;