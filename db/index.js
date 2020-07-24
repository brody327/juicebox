const { Client } = require('pg');

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev')

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username, name, location, active FROM users;`
    );

    return rows;
}

async function createUser({ username, password, name, location }) {
    try {
        const { rows: [user] } = await client.query(`
        INSERT INTO users(username, password, name, location) VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;`,
            [username, password, name, location]
        );

        return user
    } catch (error) {
        throw error;
    }
}

async function updateUser(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ')

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [user] } = await client.query(`
        UPDATE users
        SET ${setString} 
        WHERE id=${id}
        RETURNING *;
        `, Object.values(fields));

        return user;
    } catch (error) {
        throw error;
    }
}

async function createPost({ authorId, title, content }) {
    try {
        const result = await client.query(`
        INSERT INTO posts("authorId", title, content) VALUES ($1, $2, $3)
        RETURNING *;`,
            [authorId, title, content]
        );
        return result;
    } catch (error) {
        throw error;
    }
}

async function updatePost(id, {
    title,
    content,
    active
}) {
    try {
        const { rows } = await client.query(`
        UPDATE posts
        SET title=$1, content=$2, active=$3 
        WHERE id=${id}
        RETURNING *;
        `, [title, content, active]);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function getAllPosts() {
    try {
        const { rows } = await client.query(
            `SELECT id, "authorId", title, content, active FROM posts;`
        );

        return rows;
    } catch (error) {
        throw error;
    }
}

async function getPostsByUser(userId) {
    try {
        const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId};
      `);

        return rows;
    } catch (error) {
        throw error;
    }
}

async function getUserById(userId) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT id, username, name, location, active 
        FROM users
        WHERE id=${userId};
        `);

        if (!user) {
            return null;
        }

        delete user.password;

        const userPosts = await getPostsByUser(userId);

        user.posts = userPosts;

        return user;
    } catch (error) {

    }// first get the user (NOTE: Remember the query returns 
    // (1) an object that contains 
    // (2) a `rows` array that (in this case) will contain 
    // (3) one object, which is our user.
    // if it doesn't exist (if there are no `rows` or `rows.length`), return null

    // if it does:
    // delete the 'password' key from the returned object
    // get their posts (use getPostsByUser)
    // then add the posts to the user object with key 'posts'
    // return the user object
}

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    getUserById
}