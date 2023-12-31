let mysql = require("mysql");
let config = require("./config.js");
const fetch = require("node-fetch");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const multer = require("multer");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const storage = require("./firebase");

const { response } = require("express");
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));

// multer
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

app.post("/api/uploadPic", upload.single("pic"), async (req, res) => {
  const file = req.file;
  const imageRef = ref(storage, file.originalname);
  const metatype = { contentType: file.mimetype, name: file.originalname };
  await uploadBytes(imageRef, file.buffer, metatype).then((snapshot) => {
    getDownloadURL(snapshot.ref).then((imageUrl) => {
      res.send(imageUrl);
    });
  });
});

app.post("/api/createPost", (req, res) => {
  const { username, groupID, creation_date, title, description, imageUrl } =
    req.body;

  if (!username || !groupID || !creation_date || !title || !description) {
    res.status(400).send("something missing");
  } else {
    let sql = `INSERT INTO posts (username, groupID, creation_date, title, description, imageUrl) VALUES ("${username}", "${groupID}", "${creation_date}", "${title}", "${description}", "${imageUrl}")`;

    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.status(500).send("Something went wrong");
        return console.error(error.message);
      } else {
        res.send("success");
      }
    });
    connection.end();
  }
});

app.post("/api/createEvent", (req, res) => {
  console.log("hi");
  const { username, groupID, title, description, location, event_date } =
    req.body;

  if (
    !username ||
    !groupID ||
    !title ||
    !description ||
    !location ||
    !event_date
  ) {
    res.status(400).send("something missing");
  } else {
    // TODO: Hash password
    let sql = `INSERT INTO events (username, groupID, title, description, location, event_date) VALUES ("${username}", "${groupID}", "${title}", "${description}", "${location}", "${event_date}")`;

    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.status(500).send("Something went wrong");
        return console.error(error.message);
      } else {
        res.send("success");
      }
    });
    connection.end();
  }
});

app.get("/api/getUsername", (req, res) => {
  const email = req.query.email;

  if (!email) {
    res.status(400).send("email missing");
  } else {
    // TODO: Hash password
    let sql = `SELECT username FROM msci342_users WHERE email='${email}'`;
    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error || results.length == 0) {
        res.status(500).send("Something went wrong");
      } else {
        res.send(results[0].username);
      }
    });

    connection.end();
  }
});

app.post("/api/createGroup", (req, res) => {
  const { creator_user, group_name, description, categories, color } = req.body;

  if (!creator_user || !group_name || !description || !categories || !color) {
    res.status(400).send("something missing");
  } else {
    // TODO: Hash password
    let sql = `INSERT INTO msci342_groups (group_name, description, categories, creator_user, members, colour) VALUES ("${group_name}","${description}", "${categories}", "${creator_user}", 0, "${color}")`;
    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.status(500).send("Something went wrong");
        return console.error(error.message);
      } else {
        res.send("success");
      }
    });
    connection.end();
  }
});

app.post("/api/loadUserSettings", (req, res) => {
  let connection = mysql.createConnection(config);
  let userID = req.body.userID;

  let sql = `SELECT mode FROM user WHERE userID = ?`;
  console.log(sql);
  let data = [userID];
  console.log(data);

  connection.query(sql, data, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }

    let string = JSON.stringify(results);
    //let obj = JSON.parse(string);
    res.send({ express: string });
  });
  connection.end();
});

app.get("/api/test", (req, res) => {
  res.send("Hello world this API works!");
});

app.post("/api/signup", (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    res.status(400).send("Username or password or name missing");
  } else {
    // TODO: Hash password
    let sql = `INSERT INTO msci342_users (email, username) VALUES ('${email}','${username}')`;
    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.status(500).send("Something went wrong");
        return console.error(error.message);
      } else {
        res.send("success");
      }
    });
    connection.end();
  }
});
app.post("/api/getGroupPosts", (req, res) => {
  const { groupID } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM posts WHERE groupID = ${groupID} ORDER BY postID DESC`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    let string = JSON.stringify(results);
    res.send({ data: string });
  });
  connection.end();
});

app.post("/api/joinGroup", (req, res) => {
  const { groupID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `INSERT INTO users_in_group (username, groupID) VALUES ("${username}", ${groupID});
  UPDATE msci342_groups SET members = members + 1 WHERE groupID = ${groupID};`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});
app.post("/api/leaveGroup", (req, res) => {
  const { groupID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE FROM users_in_group WHERE username= "${username}" AND groupID = ${groupID};
  UPDATE msci342_groups SET members = members - 1 WHERE groupID = ${groupID};`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/getPostLikes", (req, res) => {
  const { postID } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM msci342_likes WHERE postID = ${postID}`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    let string = JSON.stringify(results);
    res.send(results);
  });
  connection.end();
});
app.post("/api/addLike", (req, res) => {
  const { postID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `INSERT INTO msci342_likes (postID, username) VALUES (${postID}, "${username}");`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/addRsvp", (req, res) => {
  const { eventID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `INSERT INTO rsvp (eventID, username) VALUES (${eventID}, "${username}");`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteRsvp", (req, res) => {
  const { eventID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE from rsvp WHERE eventID = ${eventID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteLike", (req, res) => {
  const { postID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE from msci342_likes WHERE postID = ${postID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});
app.post("/api/checkIfLiked", (req, res) => {
  const { postID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT COUNT(1) FROM msci342_likes WHERE postID = ${postID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/checkIfHost", (req, res) => {
  const { eventID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT COUNT(1) FROM events WHERE eventID = ${eventID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/getAttending", (req, res) => {
  const { eventID } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM rsvp WHERE eventID = ${eventID};`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/checkIfHostAttending", (req, res) => {
  const { eventID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT COUNT(1) FROM rsvp WHERE eventID = ${eventID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/checkIfAuthor", (req, res) => {
  const { postID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT COUNT(1) FROM posts WHERE postID = ${postID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/getGroupEvents", (req, res) => {
  const { groupID } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM events WHERE groupID = ${groupID} ORDER BY event_date;`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/deletePost", (req, res) => {
  const { postID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE from posts WHERE postID = ${postID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteEvent", (req, res) => {
  const { eventID, username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE from events WHERE eventID = ${eventID} AND username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteAllRsvp", (req, res) => {
  const { eventID } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE from rsvp WHERE eventID = ${eventID};`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteAllPostLikes", (req, res) => {
  const { postID } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE from msci342_likes WHERE postID = ${postID};`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/getJoinedGroups", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT *
  FROM users_in_group, msci342_groups
  WHERE msci342_groups.groupID = users_in_group.groupID
  AND users_in_group.username = "${username}"`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});
app.post("/api/getNotJoinedGroups", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM msci342_groups WHERE groupID NOT IN (select groupID from users_in_group WHERE username = "${username}");`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send("Username or password missing");
  } else {
    let sql = `SELECT * FROM msci342_users WHERE username='${username}'`;
    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.status(500).send("Something went wrong");
        return console.error(error.message);
      } else {
        const data = JSON.parse(JSON.stringify(results))[0];
        console.log(data);
        if (data.password != password) {
          res.status(400).send("Incorrect password");
        } else {
          res.send("success");
        }
      }
    });
    connection.end();
  }
});

app.get("/api/getGroups", (req, res) => {
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM msci342_groups`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    let string = JSON.stringify(results);
    //let obj = JSON.parse(string);
    res.send({ data: string });
  });
  connection.end();
});

app.get("/api/getGroupInfo", (req, res) => {
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM msci342_groups`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    let string = JSON.stringify(results);
    //let obj = JSON.parse(string);
    res.send({ data: string });
  });
  connection.end();
});

app.post("/api/getMyGroups", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT *
  FROM users_in_group, msci342_groups
  WHERE msci342_groups.groupID = users_in_group.groupID
  AND users_in_group.username = "${username}"`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    let string = JSON.stringify(results);
    //let obj = JSON.parse(string);
    res.send({ data: string });
  });
  connection.end();
});
app.post("/api/getUserInfo", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `SELECT * FROM msci342_users WHERE username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
  connection.end();
});
app.post("/api/deleteUserFromGroups", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE FROM users_in_group WHERE username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});
app.post("/api/deleteUserLikes", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE FROM msci342_likes WHERE username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});
app.post("/api/deleteUserFromRsvp", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE FROM rsvp WHERE username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteUsersPosts", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE FROM posts WHERE username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteGroupAdmin", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `UPDATE msci342_groups SET creator_user = "deleted" WHERE creator_user = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.post("/api/deleteUserFromTable", (req, res) => {
  const { username } = req.body;
  let connection = mysql.createConnection(config);

  let sql = `DELETE FROM msci342_users WHERE username = "${username}";`;
  console.log(sql);

  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    res.send({ message: "success" });
  });
  connection.end();
});

app.get("/api/getEmail", (req, res) => {
  const username = req.query.username;

  if (!username) {
    res.status(400).send("username missing");
  } else {
    // TODO: Hash password
    let sql = `SELECT email FROM msci342_users WHERE username='${username}'`;
    let connection = mysql.createConnection(config);

    connection.query(sql, (error, results, fields) => {
      if (error) {
        res.status(500).send("Something went wrong");
        return console.error(error.message);
      } else {
        res.send(results[0].email);
      }
    });

    connection.end();
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '129.97.25.211'); //for the deployed version, specify the IP address of the server
